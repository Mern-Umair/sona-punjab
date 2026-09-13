import { useState, useEffect } from "react";
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

function formatTimeInput(val) {
    const digits = String(val || "").replace(/\D/g, "").slice(0, 6);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}:${digits.slice(2)}`;
    return `${digits.slice(0, 2)}:${digits.slice(2, 4)}:${digits.slice(4)}`;
}

function normalizeTime(val) {
    if (!val) return "";
    const formatted = formatTimeInput(val);
    const match = formatted.match(/^(\d{2}):(\d{2}):(\d{2})$/);
    if (!match) return formatted;
    const h = Number(match[1]);
    const m = Number(match[2]);
    const s = Number(match[3]);
    if (h > 23 || m > 59 || s > 59) return formatted;
    return formatted;
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

function TimeInput({
    value,
    onChange,
    onSave,
    onClear,
    onCancel,
    saving,
    showDoubleStamp = false,
    doubleStamp = false,
    onDoubleStampChange,
}) {
    const canSave = !value || isValidTime(value);

    return (
        <div
            onClick={(e) => e.stopPropagation()}
            className="absolute z-20 top-full left-0 bg-white border-2 border-[#0ea5e9] rounded-lg p-3 shadow-lg w-48 max-w-[90vw]"
        >
            <input
                type="text"
                inputMode="numeric"
                autoFocus
                placeholder="HH:MM:SS"
                maxLength={8}
                value={value || ""}
                onChange={(e) => onChange(formatTimeInput(e.target.value))}
                onBlur={(e) => onChange(normalizeTime(e.target.value))}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        if (canSave) onSave();
                    }
                    if (e.key === "Escape") onCancel();
                }}
                className={`w-full border rounded px-2 py-1 text-sm mb-1 outline-none
                  ${value && !isValidTime(value) ? "border-red-400" : "border-slate-200"}`}
            />
            <p className="text-[10px] text-slate-400 mb-2">Format: HH:MM:SS</p>
            {showDoubleStamp && (
                <label className="flex items-center gap-2 mb-2 text-xs text-slate-700 cursor-pointer select-none">
                    <input
                        type="checkbox"
                        checked={!!doubleStamp}
                        onChange={(e) => onDoubleStampChange?.(e.target.checked)}
                        className="w-3.5 h-3.5 accent-[#0ea5e9]"
                    />
                    Double Stamp
                </label>
            )}
            <div className="flex gap-1">
                <button onClick={onClear} className="flex-1 text-xs bg-slate-100 rounded py-1">
                    Clear
                </button>
                <button onClick={onCancel} className="flex-1 text-xs bg-red-50 text-red-600 rounded py-1">
                    Cancel
                </button>
                <button
                    onClick={onSave}
                    disabled={saving || !canSave}
                    className="flex-1 text-xs bg-green-50 text-green-700 rounded py-1 disabled:opacity-50"
                >
                    Save
                </button>
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
                    <table className="w-full text-xs sm:text-sm min-w-[640px]">
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
                                        <tr key={owner._id} className="border-t border-slate-100">
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
