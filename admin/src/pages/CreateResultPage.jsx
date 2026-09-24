import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import {
    useGetTournamentQuery,
    useGetTournamentByDayQuery,
    useSaveOwnerDayResultMutation,
} from "../../redux/api/tournamentApi";

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
    return padded.join(":");
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

const PART_LABELS = ["HH", "MM", "SS"];
const PART_MAX = [23, 59, 59];

/**
 * Time entry dialog. Three separate boxes (hours / minutes / seconds) so the
 * operator never has to type or fight with colons. Cursor auto-advances.
 */
function TimeInput({
    title,
    subtitle,
    value,
    onChange,
    onSave,
    onClear,
    onCancel,
    saving,
    showDoubleStamp = false,
    doubleStamp = false,
    onDoubleStampChange,
    flyTime = "",
}) {
    const [h = "", m = "", sec = ""] = String(value || "").split(":");
    const parts = [h, m, sec];
    const ref0 = useRef(null);
    const ref1 = useRef(null);
    const ref2 = useRef(null);
    const refs = [ref0, ref1, ref2];

    useEffect(() => {
        ref0.current?.focus();
        ref0.current?.select();
    }, []);

    const focusPart = (i) => {
        const el = refs[i]?.current;
        if (!el) return;
        el.focus();
        el.select();
    };

    const emit = (next) => {
        onChange(next.every((x) => x === "") ? "" : next.join(":"));
    };

    const setPart = (i, rawVal) => {
        const digitsAll = String(rawVal).replace(/\D/g, "");
        // Pasted / typed a full time into one box -> spread across boxes
        if (digitsAll.length > 2) {
            const spread = [digitsAll.slice(0, 2), digitsAll.slice(2, 4), digitsAll.slice(4, 6)];
            emit(spread);
            focusPart(spread[2] ? 2 : spread[1] ? 1 : 0);
            return;
        }
        let digits = digitsAll;
        const next = [...parts];
        // First digit already too big for this slot (e.g. "7" hours, "8" minutes) -> pad and move on
        if (digits.length === 1 && Number(digits) > (i === 0 ? 2 : 5)) {
            digits = "0" + digits;
        }
        next[i] = digits;
        emit(next);
        if (digits.length === 2 && i < 2) focusPart(i + 1);
    };

    const blurPart = (i) => {
        const next = [...parts];
        next[i] = padPart(next[i]);
        if (next[i] !== parts[i]) emit(next);
    };

    const normalized = normalizeTime(value);
    const isEmpty = !normalized;
    const valid = isEmpty || isValidTime(normalized);
    const canSave = valid;
    const partInvalid = (i) => parts[i] !== "" && Number(parts[i]) > PART_MAX[i];
    const finalTime = !isEmpty && valid && flyTime ? convertPmTo24Hour(normalized, flyTime) : normalized;
    const pmApplied = !!finalTime && finalTime !== normalized;

    const handleKey = (i, e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (canSave) onSave();
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

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onCancel();
            }}
        >
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-xs p-4 text-left">
                <p className="text-[#122654] font-bold text-sm leading-tight">{title}</p>
                {subtitle && <p className="text-slate-400 text-xs mt-0.5">{subtitle}</p>}

                <div className="flex items-start justify-center gap-1 mt-4">
                    {parts.map((part, i) => (
                        <div key={i} className="flex items-start gap-1">
                            <div className="flex flex-col items-center">
                                <input
                                    ref={refs[i]}
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="off"
                                    placeholder="00"
                                    value={part}
                                    onChange={(e) => setPart(i, e.target.value)}
                                    onBlur={() => blurPart(i)}
                                    onFocus={(e) => e.target.select()}
                                    onKeyDown={(e) => handleKey(i, e)}
                                    className={`w-16 h-14 text-center text-2xl font-bold tabular-nums rounded-lg border-2 outline-none transition-colors
                                      ${partInvalid(i)
                                            ? "border-red-400 bg-red-50 text-red-700"
                                            : "border-slate-200 focus:border-[#0ea5e9] text-[#122654]"}`}
                                />
                                <span className="text-[10px] text-slate-400 mt-1 font-medium">{PART_LABELS[i]}</span>
                            </div>
                            {i < 2 && <span className="text-2xl font-bold text-slate-300 leading-[3.5rem]">:</span>}
                        </div>
                    ))}
                </div>

                <div className="mt-3 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-600">
                    {isEmpty ? (
                        <span>Time khali hai — Save karne se time clear ho jayega.</span>
                    ) : !valid ? (
                        <span className="text-red-600">Ghalat time: HH 00–23, MM/SS 00–59.</span>
                    ) : (
                        <span>
                            Save hoga:{" "}
                            <strong className="text-[#122654] tabular-nums">{finalTime}</strong>
                            {pmApplied && (
                                <span className="text-amber-700"> (fly time se pehle → PM samjha gaya)</span>
                            )}
                        </span>
                    )}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                    Sirf number likhein — cursor khud agle box mein chala jayega. Enter = Save, Esc = Cancel.
                </p>

                {showDoubleStamp && (
                    <label className="flex items-center gap-2 mt-3 text-xs text-slate-700 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={!!doubleStamp}
                            onChange={(e) => onDoubleStampChange?.(e.target.checked)}
                            className="w-3.5 h-3.5 accent-[#0ea5e9]"
                        />
                        Double Stamp
                    </label>
                )}

                <div className="flex gap-2 mt-4">
                    <button onClick={onClear} className="flex-1 text-xs bg-slate-100 hover:bg-slate-200 rounded-lg py-2 font-medium">
                        Clear
                    </button>
                    <button onClick={onCancel} className="flex-1 text-xs bg-red-50 text-red-600 hover:bg-red-100 rounded-lg py-2 font-medium">
                        Cancel
                    </button>
                    <button
                        onClick={onSave}
                        disabled={saving || !canSave}
                        className="flex-1 text-xs bg-[#0ea5e9] text-white hover:bg-[#0284c7] rounded-lg py-2 font-semibold disabled:opacity-50"
                    >
                        {saving ? "Saving…" : "Save"}
                    </button>
                </div>
            </div>
        </div>
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

    const clearFlyTime = async (ownerId) => {
        const draft = draftData[ownerId] || getOwnerDraft(ownerId);
        updateDraft(ownerId, "startTime", "");
        await saveToDatabase(ownerId, { ...draft, startTime: "" });
    };

    const clearPigeonTime = async (ownerId, index) => {
        const draft = draftData[ownerId] || getOwnerDraft(ownerId);
        const times = [...draft.times];
        const doubleStamps = [...(draft.doubleStamps || Array(totalSlots).fill(false))];
        times[index] = "";
        doubleStamps[index] = false;
        updateDraft(ownerId, "times", "", index);
        updateDraft(ownerId, "doubleStamp", false, index);
        await saveToDatabase(ownerId, { ...draft, times, doubleStamps });
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
                <div className="flex flex-wrap gap-2 mb-4">
                    {tournament?.dates?.map((d, i) => {
                        const iso = new Date(d).toISOString().split("T")[0];
                        return (
                            <button
                                key={i}
                                onClick={() => setActiveDate(iso)}
                                className={`px-4 py-1.5 text-xs font-semibold rounded border-2 transition-colors
                  ${activeDate === iso
                                        ? "border-[#122654] bg-[#122654] text-white"
                                        : "border-[#122654] text-[#122654] bg-white hover:bg-slate-50"
                                    }`}
                            >
                                {formatDate(d)}
                            </button>
                        );
                    })}
                </div>
                <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                    <table className="results-table w-full text-xs sm:text-sm min-w-[640px]">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                <th className="px-3 py-3 text-left text-slate-500 font-medium w-10">Sr#</th>
                                <th className="px-3 py-3 text-left text-slate-500 font-medium">Owner</th>
                                <th className="px-3 py-3 text-center text-slate-500 font-medium">Fly Time</th>
                                {Array.from({ length: pigeons }).map((_, i) => (
                                    <th key={i} className="px-3 py-3 text-center text-slate-500 font-medium">
                                        {i + 1}
                                    </th>
                                ))}
                                {Array.from({ length: helperPigeons }).map((_, i) => (
                                    <th key={`h${i}`} className="px-3 py-3 text-center text-slate-500 font-medium">
                                        {pigeons + i + 1}
                                    </th>
                                ))}
                                <th className="px-3 py-3 text-center text-slate-500 font-medium">Result</th>
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
                                            <td className="px-3 py-3 text-slate-400">{i + 1}</td>
                                            <td className="px-3 py-3">
                                                <div className="flex items-center gap-2">
                                                    {owner.imageUrl ? (
                                                        <img src={owner.imageUrl} className="w-8 h-8 rounded-full object-cover" alt="" />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs">
                                                            {owner.name?.charAt(0)}
                                                        </div>
                                                    )}
                                                    <span className="text-slate-700 font-medium">{owner.name}</span>
                                                </div>
                                            </td>

                                            <td
                                                onClick={() => openCell(owner._id, "startTime")}
                                                className="px-2 py-3 text-center cursor-pointer hover:bg-slate-50 relative"
                                            >
                                                {draft.startTime || "—"}
                                                {editingCell?.ownerId === owner._id && editingCell?.field === "startTime" && (
                                                    <TimeInput
                                                        title={`Fly Time — ${owner.name}`}
                                                        subtitle={activeDate ? formatDate(activeDate) : ""}
                                                        value={draft.startTime}
                                                        onChange={(val) => updateDraft(owner._id, "startTime", val)}
                                                        onClear={() => clearFlyTime(owner._id)}
                                                        onCancel={() => setEditingCell(null)}
                                                        onSave={() => saveFlyTime(owner._id)}
                                                        saving={saving}
                                                    />
                                                )}
                                            </td>

                                            {Array.from({ length: totalSlots }).map((_, idx) => (
                                                <td
                                                    key={idx}
                                                    onClick={() => openCell(owner._id, "times", idx)}
                                                    className="px-2 py-3 text-center cursor-pointer hover:bg-slate-50 relative"
                                                >
                                                    <span className="inline-flex flex-col items-center justify-center gap-0.5">
                                                        {draft.times[idx] || "—"}
                                                        {draft.doubleStamps?.[idx] && draft.times[idx] ? (
                                                            <span className="inline-block rounded px-1 py-px text-[9px] font-semibold leading-none bg-amber-100 text-amber-700 border border-amber-300 whitespace-nowrap">
                                                                Double Stamp
                                                            </span>
                                                        ) : null}
                                                    </span>
                                                    {editingCell?.ownerId === owner._id &&
                                                        editingCell?.field === "times" &&
                                                        editingCell?.index === idx && (
                                                            <TimeInput
                                                                title={`Pigeon #${idx + 1} — ${owner.name}`}
                                                                subtitle={`Fly Time: ${draft.startTime || "—"}`}
                                                                flyTime={draft.startTime}
                                                                value={draft.times[idx]}
                                                                onChange={(val) => updateDraft(owner._id, "times", val, idx)}
                                                                onClear={() => clearPigeonTime(owner._id, idx)}
                                                                onCancel={() => setEditingCell(null)}
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

                                            <td className="px-3 py-3 text-center font-bold text-[#122654]">
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
