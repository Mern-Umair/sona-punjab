import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useParams, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import {
    useGetTournamentQuery,
    useGetTournamentByDayQuery,
    useSaveOwnerDayResultMutation,
} from "../../redux/api/tournamentApi";
import FitRow, { FitDate } from "../components/FitRow";

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
}

function padPart(part) {
    const digits = String(part || "").replace(/\D/g, "").slice(0, 2);
    return digits === "" ? "" : digits.padStart(2, "0");
}

/** Accepts "H:M:S", "HH:MM:SS" or raw digits "HHMMSS" and returns "HH:MM:SS" ("" when empty). */
function normalizeTime(val) {
    if (!val) return "";
    const str = String(val).trim();
    let parts;
    if (str.includes(":")) {
        parts = str.split(":").slice(0, 3);
    } else {
        const d = str.replace(/\D/g, "").slice(0, 6);
        parts = [d.slice(0, 2), d.slice(2, 4), d.slice(4, 6)];
    }
    while (parts.length < 3) parts.push("");
    const padded = parts.map(padPart);
    if (padded.every((x) => x === "")) return "";
    // A part left empty counts as 00 (e.g. "12:34" -> "12:34:00")
    return padded.map((x) => (x === "" ? "00" : x)).join(":");
}

function isValidTime(val) {
    if (!val) return true;
    const match = String(val).match(/^(\d{2}):(\d{2}):(\d{2})$/);
    if (!match) return false;
    const h = Number(match[1]);
    const m = Number(match[2]);
    const s = Number(match[3]);
    return h <= 23 && m <= 59 && s <= 59;
}

function timeToSeconds(t) {
    if (!t) return null;
    const parts = String(t).split(":").map(Number);
    if (parts.some((n) => Number.isNaN(n))) return null;
    const [h = 0, m = 0, s = 0] = parts;
    return h * 3600 + m * 60 + s;
}

/** Operator enters 12h clock without AM/PM. If time is before fly time (e.g. 02:55 with fly 05:00), treat as PM → 14:55. */
function convertPmTo24Hour(timeStr, flyTimeStr) {
    const t = normalizeTime(timeStr);
    if (!t || !isValidTime(t)) return t;

    const [h, m, s] = t.split(":").map(Number);
    if (h === 0 || h >= 12) return t;

    const flySec = timeToSeconds(flyTimeStr);
    const arrSec = timeToSeconds(t);
    if (flySec === null || arrSec === null) return t;

    if (arrSec < flySec) {
        return `${String(h + 12).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }
    return t;
}

const PART_MAX = [23, 59, 59];
const POP_W = 210;

function CheckIcon() {
    return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
    );
}
function CrossIcon() {
    return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M6 18L18 6" />
        </svg>
    );
}

/**
 * Compact time popover under the clicked cell.
 * Three boxes (HH / MM / SS) with auto-advance, a tick to save, a cross to close.
 * Tapping anywhere outside closes it. Positioned fixed and clamped to the
 * viewport so it is never clipped by the table scroll box on phones.
 */
function TimeInput({
    value,
    onChange,
    onSave,
    onCancel,
    saving,
    showDoubleStamp = false,
    doubleStamp = false,
    onDoubleStampChange,
    flyTime = "",
}) {
    const [h = "", m = "", sec = ""] = String(value || "").split(":");
    const parts = [h, m, sec];
    // Always holds the newest parts, including ones emitted in this same event
    // (a blur fired by moving focus must not overwrite a value just typed).
    const partsRef = useRef(parts);
    useEffect(() => {
        partsRef.current = parts;
    });

    const ref0 = useRef(null);
    const ref1 = useRef(null);
    const ref2 = useRef(null);
    const refs = [ref0, ref1, ref2];
    const boxRef = useRef(null);
    const anchorRef = useRef(null);
    const [pos, setPos] = useState(null);

    // Position relative to the cell once mounted, then focus the first box.
    const setBox = useCallback((node) => {
        boxRef.current = node;
        if (!node) return;
        const cell = anchorRef.current;
        if (cell) {
            const r = cell.getBoundingClientRect();
            // Page coordinates (not fixed): the popover scrolls with the page, so when the
            // phone keyboard opens the browser can scroll it into view instead of hiding it.
            // Clamped inside the table's scroll box so it never hangs off the table edge.
            const wrap = cell.closest(".overflow-x-auto");
            const w = wrap ? wrap.getBoundingClientRect() : { left: 0, right: window.innerWidth };
            const minLeft = Math.max(4, w.left + 4);
            const maxLeft = Math.min(window.innerWidth, w.right) - POP_W - 4;
            let left = r.left;
            if (left > maxLeft) left = Math.max(minLeft, maxLeft);
            if (left < minLeft) left = minLeft;
            setPos({ top: r.bottom + window.scrollY + 2, left: left + window.scrollX });
        }
        ref0.current?.focus();
        ref0.current?.select();
    }, []);

    // Tap / click outside closes the popover
    useEffect(() => {
        const onDown = (e) => {
            if (boxRef.current && !boxRef.current.contains(e.target)) onCancel();
        };
        document.addEventListener("mousedown", onDown);
        document.addEventListener("touchstart", onDown);
        return () => {
            document.removeEventListener("mousedown", onDown);
            document.removeEventListener("touchstart", onDown);
        };
    }, [onCancel]);

    const focusPart = (i) => {
        const el = refs[i]?.current;
        if (!el) return;
        el.focus();
        el.select();
    };

    const emit = (next) => {
        partsRef.current = next;
        onChange(next.every((x) => x === "") ? "" : next.join(":"));
    };

    const setPart = (i, rawVal) => {
        const digitsAll = String(rawVal).replace(/\D/g, "");
        if (digitsAll.length > 2) {
            // A whole time pasted/typed into one box -> spread it
            const spread = [digitsAll.slice(0, 2), digitsAll.slice(2, 4), digitsAll.slice(4, 6)];
            emit(spread);
            focusPart(spread[2] ? 2 : spread[1] ? 1 : 0);
            return;
        }
        let digits = digitsAll;
        const next = [...partsRef.current];
        // First digit too big for this slot (e.g. 7 hours, 8 minutes) -> pad and move on
        if (digits.length === 1 && Number(digits) > (i === 0 ? 2 : 5)) digits = "0" + digits;
        next[i] = digits;
        emit(next);
        if (digits.length === 2 && i < 2) focusPart(i + 1);
    };

    const blurPart = (i) => {
        const current = partsRef.current;
        const padded = padPart(current[i]);
        if (padded !== current[i]) {
            const next = [...current];
            next[i] = padded;
            emit(next);
        }
    };

    const normalized = normalizeTime(value);
    const isEmpty = !normalized;
    const valid = isEmpty || isValidTime(normalized);
    const partInvalid = (i) => parts[i] !== "" && Number(parts[i]) > PART_MAX[i];
    const finalTime = !isEmpty && valid && flyTime ? convertPmTo24Hour(normalized, flyTime) : normalized;
    const pmApplied = !!finalTime && finalTime !== normalized;

    const handleKey = (i, e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (valid) onSave();
            return;
        }
        if (e.key === "Escape") {
            onCancel();
            return;
        }
        if (e.key === ":" || e.key === "." || e.key === " ") {
            e.preventDefault();
            if (i < 2) focusPart(i + 1);
            return;
        }
        if (e.key === "Backspace" && parts[i] === "" && i > 0) {
            e.preventDefault();
            focusPart(i - 1);
            return;
        }
        const el = e.target;
        if (e.key === "ArrowRight" && i < 2 && el.selectionStart === parts[i].length) {
            e.preventDefault();
            focusPart(i + 1);
        }
        if (e.key === "ArrowLeft" && i > 0 && el.selectionStart === 0) {
            e.preventDefault();
            focusPart(i - 1);
        }
    };

    const boxClass = (i) =>
        `w-10 h-9 text-center text-sm font-bold tabular-nums rounded border outline-none
         ${partInvalid(i) ? "border-red-400 bg-red-50 text-red-700" : "border-slate-300 focus:border-[#0ea5e9] text-[#122654]"}`;

    const popover = (
        <div
            ref={setBox}
            onClick={(e) => e.stopPropagation()}
            style={{
                position: "absolute",
                top: pos ? pos.top : -9999,
                left: pos ? pos.left : -9999,
                width: POP_W,
                zIndex: 1000,
            }}
            className="bg-white border-2 border-[#0ea5e9] rounded-lg p-2 shadow-lg text-left"
        >
            <div className="flex items-center justify-center gap-1">
                <input ref={ref0} type="text" inputMode="numeric" autoComplete="off" placeholder="00" value={parts[0]}
                    onChange={(e) => setPart(0, e.target.value)} onBlur={() => blurPart(0)}
                    onFocus={(e) => e.target.select()} onKeyDown={(e) => handleKey(0, e)} className={boxClass(0)} />
                <span className="text-slate-400 font-bold">:</span>
                <input ref={ref1} type="text" inputMode="numeric" autoComplete="off" placeholder="00" value={parts[1]}
                    onChange={(e) => setPart(1, e.target.value)} onBlur={() => blurPart(1)}
                    onFocus={(e) => e.target.select()} onKeyDown={(e) => handleKey(1, e)} className={boxClass(1)} />
                <span className="text-slate-400 font-bold">:</span>
                <input ref={ref2} type="text" inputMode="numeric" autoComplete="off" placeholder="00" value={parts[2]}
                    onChange={(e) => setPart(2, e.target.value)} onBlur={() => blurPart(2)}
                    onFocus={(e) => e.target.select()} onKeyDown={(e) => handleKey(2, e)} className={boxClass(2)} />
            </div>

            {/* Second row: Double Stamp on the left, tick and cross far apart on the right */}
            <div className="flex items-center justify-between gap-2 mt-2">
                {showDoubleStamp ? (
                    <label className="flex items-center gap-1.5 text-[11px] text-slate-700 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={!!doubleStamp}
                            onChange={(e) => onDoubleStampChange?.(e.target.checked)}
                            className="w-4 h-4 accent-[#0ea5e9]"
                        />
                        Double Stamp
                    </label>
                ) : (
                    <span />
                )}
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        title="Save"
                        onClick={onSave}
                        disabled={saving || !valid}
                        className="w-9 h-8 rounded bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-40 flex items-center justify-center"
                    >
                        <CheckIcon />
                    </button>
                    <button
                        type="button"
                        title="Close"
                        onClick={onCancel}
                        className="w-9 h-8 rounded bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center"
                    >
                        <CrossIcon />
                    </button>
                </div>
            </div>

            {!valid ? (
                <p className="text-[10px] text-red-600 mt-1">Invalid: HH 00-23, MM/SS 00-59</p>
            ) : pmApplied ? (
                <p className="text-[10px] text-amber-700 mt-1">Will be saved as {finalTime} (PM)</p>
            ) : null}
        </div>
    );

    // Invisible anchor stays inside the cell; the popover itself is portaled to <body>
    // so the table's scroll box can never clip it.
    return (
        <>
            <span ref={anchorRef} className="absolute inset-0 pointer-events-none" aria-hidden="true" />
            {createPortal(popover, document.body)}
        </>
    );
}

export default function CreateResultPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data: tData, isLoading: tLoading } = useGetTournamentQuery(id);
    const tournament = tData?.data;

    const [activeDate, setActiveDate] = useState(null);

    useEffect(() => {
        if (tournament?.dates?.length && !activeDate) {
            setActiveDate(new Date(tournament.dates[0]).toISOString().split("T")[0]);
        }
    }, [tournament, activeDate]);

    const { data: dayData, isLoading: dayLoading } = useGetTournamentByDayQuery(
        { id, date: activeDate },
        { skip: !activeDate }
    );
    const day = dayData?.data?.day;
    const results = day?.results || [];

    const [saveResult, { isLoading: saving }] = useSaveOwnerDayResultMutation();

    const pigeons = tournament?.pigeons || 0;
    const helperPigeons = tournament?.helperPigeons || 0;
    const totalSlots = pigeons + helperPigeons;

    const [editingCell, setEditingCell] = useState(null);
    const [draftData, setDraftData] = useState({});

    useEffect(() => {
        setDraftData({});
        setEditingCell(null);
    }, [activeDate]);

    const getOwnerDraft = (ownerId) => {
        if (draftData[ownerId]) return draftData[ownerId];
        const existing = results.find((r) => r.owner?._id === ownerId);
        const times = existing?.times?.length ? existing.times : Array(totalSlots).fill("");
        const stamps = existing?.doubleStamps?.length
            ? [...existing.doubleStamps]
            : Array(totalSlots).fill(false);
        while (stamps.length < totalSlots) stamps.push(false);
        return {
            times,
            startTime: existing?.startTime || tournament?.startTime || "",
            doubleStamps: stamps.slice(0, totalSlots),
        };
    };

    /** Close the popover and throw away unsaved typing for that owner (cell reverts to saved value). */
    const cancelEdit = (ownerId) => {
        setDraftData((prev) => {
            const next = { ...prev };
            delete next[ownerId];
            return next;
        });
        setEditingCell(null);
    };

    const openCell = (ownerId, field, index = null) => {
        setDraftData((prev) => ({ ...prev, [ownerId]: getOwnerDraft(ownerId) }));
        setEditingCell({ ownerId, field, index });
    };

    const updateDraft = (ownerId, field, value, index = null) => {
        setDraftData((prev) => {
            const current = prev[ownerId] || getOwnerDraft(ownerId);
            if (field === "startTime") {
                return { ...prev, [ownerId]: { ...current, startTime: value } };
            }
            if (field === "doubleStamp") {
                const stamps = [...(current.doubleStamps || Array(totalSlots).fill(false))];
                stamps[index] = !!value;
                return { ...prev, [ownerId]: { ...current, doubleStamps: stamps } };
            }
            const arr = [...current.times];
            arr[index] = value;
            return { ...prev, [ownerId]: { ...current, times: arr } };
        });
    };

    const saveToDatabase = async (ownerId, draftOverride = null) => {
        try {
            const draft = draftOverride ?? (draftData[ownerId] || getOwnerDraft(ownerId));
            const startTime = normalizeTime(draft.startTime);
            const times = draft.times.map((t) => convertPmTo24Hour(normalizeTime(t), startTime));
            const doubleStamps = Array.from({ length: totalSlots }, (_, i) =>
                !!draft.doubleStamps?.[i] && !!times[i]
            );

            await saveResult({
                id,
                date: activeDate,
                ownerId,
                times,
                startTime,
                doubleStamps,
            }).unwrap();

            setDraftData((prev) => ({
                ...prev,
                [ownerId]: { ...draft, startTime, times, doubleStamps },
            }));
            setEditingCell(null);
        } catch (err) {
            toast.error(err?.data?.message || "Save failed!");
        }
    };

    const saveFlyTime = async (ownerId) => {
        const draft = draftData[ownerId] || getOwnerDraft(ownerId);
        const startTime = normalizeTime(draft.startTime);
        if (startTime && !isValidTime(startTime)) {
            toast.error("Time must be HH:MM:SS");
            return;
        }
        await saveToDatabase(ownerId, {
            ...draft,
            startTime,
        });
    };

    const savePigeonTime = async (ownerId, index) => {
        const draft = draftData[ownerId] || getOwnerDraft(ownerId);
        const times = [...draft.times];
        times[index] = normalizeTime(times[index]);
        if (times[index] && !isValidTime(times[index])) {
            toast.error("Time must be HH:MM:SS");
            return;
        }
        const startTime = normalizeTime(draft.startTime);
        times[index] = convertPmTo24Hour(times[index], startTime);
        await saveToDatabase(ownerId, { ...draft, startTime, times });
    };

    if (tLoading) {
        return <div className="py-20 text-center text-slate-400">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <Toaster position="top-right" />
            <div className="flex items-center gap-3">
                <button
                    onClick={() => navigate("/tournaments")}
                    className="text-slate-400 hover:text-[#122654] transition-colors text-xl"
                >
                    ←
                </button>
                <h2 className="text-[#122654] font-bold text-xl">
                    Create Result — {tournament?.name}
                </h2>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4">
                {/* Dates: always one row, shrinks to fit the screen */}
                <FitRow className="mb-4 !justify-start">
                    {tournament?.dates?.map((d, i) => {
                        const iso = new Date(d).toISOString().split("T")[0];
                        return (
                            <button
                                key={i}
                                onClick={() => setActiveDate(iso)}
                                className={`fit-tab font-semibold rounded transition-colors whitespace-nowrap
                  ${activeDate === iso
                                        ? "border-[#122654] bg-[#122654] text-white"
                                        : "border-sky-300 text-[#122654] bg-sky-100 hover:bg-sky-200"
                                    }`}
                            >
                                <FitDate full={formatDate(d)} short={formatDate(d).slice(0, 5)} />
                            </button>
                        );
                    })}
                </FitRow>
                <div className="overflow-x-auto">
                    <table className="results-table w-full" style={{ fontSize: "clamp(9px, 2.2vw, 14px)" }}>
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                <th className="text-center text-slate-500 font-medium whitespace-nowrap" style={{ padding: "clamp(4px, 1.2vw, 12px)" }}>Sr#</th>
                                <th className="text-left text-slate-500 font-medium whitespace-nowrap" style={{ padding: "clamp(4px, 1.2vw, 12px)" }}>Owner</th>
                                <th className="text-center text-slate-500 font-medium whitespace-nowrap" style={{ padding: "clamp(4px, 1.2vw, 12px)" }}>Fly Time</th>
                                {Array.from({ length: pigeons }).map((_, i) => (
                                    <th key={i} className="text-center text-slate-500 font-medium whitespace-nowrap" style={{ padding: "clamp(4px, 1.2vw, 12px)" }}>
                                        {i + 1}
                                    </th>
                                ))}
                                {Array.from({ length: helperPigeons }).map((_, i) => (
                                    <th key={`h${i}`} className="text-center text-slate-500 font-medium whitespace-nowrap" style={{ padding: "clamp(4px, 1.2vw, 12px)" }}>
                                        {pigeons + i + 1}
                                    </th>
                                ))}
                                <th className="text-center text-slate-500 font-medium whitespace-nowrap" style={{ padding: "clamp(4px, 1.2vw, 12px)" }}>Result</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dayLoading ? (
                                <tr>
                                    <td colSpan={totalSlots + 4} className="text-center py-8 text-slate-400">
                                        Loading...
                                    </td>
                                </tr>
                            ) : (
                                (tournament?.owners || []).map((owner, i) => {
                                    const existing = results.find((r) => r.owner?._id === owner._id);
                                    const draft = getOwnerDraft(owner._id);
                                    return (
                                        <tr key={owner._id}>
                                            <td className="text-center text-slate-400" style={{ padding: "clamp(4px, 1.2vw, 12px)" }}>{i + 1}</td>
                                            <td className="whitespace-nowrap" style={{ padding: "clamp(4px, 1.2vw, 12px)" }}>
                                                {/* w-max: the cell's min width must include avatar + full name, so the name never spills into the next column */}
                                                <div className="flex items-center gap-2 w-max">
                                                    {owner.imageUrl ? (
                                                        <img src={owner.imageUrl} className="w-8 h-8 rounded-full object-cover" alt="" />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs">
                                                            {owner.name?.charAt(0)}
                                                        </div>
                                                    )}
                                                    <span className="text-slate-700 font-medium whitespace-nowrap">{owner.name}</span>
                                                </div>
                                            </td>

                                            <td
                                                onClick={() => openCell(owner._id, "startTime")}
                                                className="text-center cursor-pointer hover:bg-slate-50 relative whitespace-nowrap"
                                                style={{ padding: "clamp(4px, 1.2vw, 12px)" }}
                                            >
                                                {draft.startTime || "—"}
                                                {editingCell?.ownerId === owner._id && editingCell?.field === "startTime" && (
                                                    <TimeInput
                                                        value={draft.startTime}
                                                        onChange={(val) => updateDraft(owner._id, "startTime", val)}
                                                        onCancel={() => cancelEdit(owner._id)}
                                                        onSave={() => saveFlyTime(owner._id)}
                                                        saving={saving}
                                                    />
                                                )}
                                            </td>

                                            {Array.from({ length: totalSlots }).map((_, idx) => (
                                                <td
                                                    key={idx}
                                                    onClick={() => openCell(owner._id, "times", idx)}
                                                    className="text-center cursor-pointer hover:bg-slate-50 relative whitespace-nowrap"
                                                    style={{ padding: "clamp(4px, 1.2vw, 12px)" }}
                                                >
                                                    <span className="inline-flex flex-col items-center justify-center gap-0.5">
                                                        {draft.times[idx] || "—"}
                                                        {draft.doubleStamps?.[idx] && draft.times[idx] ? (
                                                            <span title="Double Stamp" className="inline-block rounded px-1 py-px text-[9px] font-semibold leading-none bg-sky-100 text-sky-700 border border-sky-300 whitespace-nowrap">
                                                                D
                                                            </span>
                                                        ) : null}
                                                    </span>
                                                    {editingCell?.ownerId === owner._id &&
                                                        editingCell?.field === "times" &&
                                                        editingCell?.index === idx && (
                                                            <TimeInput
                                                                flyTime={draft.startTime}
                                                                value={draft.times[idx]}
                                                                onChange={(val) => updateDraft(owner._id, "times", val, idx)}
                                                                onCancel={() => cancelEdit(owner._id)}
                                                                onSave={() => savePigeonTime(owner._id, idx)}
                                                                saving={saving}
                                                                showDoubleStamp
                                                                doubleStamp={!!draft.doubleStamps?.[idx]}
                                                                onDoubleStampChange={(checked) =>
                                                                    updateDraft(owner._id, "doubleStamp", checked, idx)
                                                                }
                                                            />
                                                        )}
                                                </td>
                                            ))}

                                            <td className="text-center font-bold text-[#122654] whitespace-nowrap" style={{ padding: "clamp(4px, 1.2vw, 12px)" }}>
                                                {existing?.total || "00:00:00"}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
