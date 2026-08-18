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

    const [editingCell, setEditingCell] = useState(null); // { ownerId, field, index }
    const [draftData, setDraftData] = useState({}); // { ownerId: { times: [], startTime: "" } }

    useEffect(() => {
        setDraftData({});
        setEditingCell(null);
    }, [activeDate]);

    const getOwnerDraft = (ownerId) => {
        if (draftData[ownerId]) return draftData[ownerId];
        const existing = results.find((r) => r.owner?._id === ownerId);
        return {
            times: existing?.times?.length ? existing.times : Array(totalSlots).fill(""),
            startTime: existing?.startTime || tournament?.startTime || "",
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
            const arr = [...current.times];
            arr[index] = value;
            return { ...prev, [ownerId]: { ...current, times: arr } };
        });
    };

    const handleSave = async (ownerId) => {
        try {
            const draft = draftData[ownerId] || getOwnerDraft(ownerId);
            await saveResult({
                id,
                date: activeDate,
                ownerId,
                times: draft.times,
                startTime: draft.startTime,
            }).unwrap();
            toast.success("Result saved!");
            setEditingCell(null);
        } catch (err) {
            toast.error(err?.data?.message || "Save failed!");
        }
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
                                <th className="px-3 py-3 text-center text-slate-500 font-medium">Save</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dayLoading ? (
                                <tr>
                                    <td colSpan={totalSlots + 5} className="text-center py-8 text-slate-400">
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

                                            {/* Fly Time — editable */}
                                            <td
                                                onClick={() => openCell(owner._id, "startTime")}
                                                className="px-2 py-3 text-center cursor-pointer hover:bg-slate-50 relative"
                                            >
                                                {draft.startTime || "—"}
                                                {editingCell?.ownerId === owner._id && editingCell?.field === "startTime" && (
                                                    <div
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="absolute z-20 top-full left-0 bg-white border-2 border-[#0ea5e9] rounded-lg p-3 shadow-lg w-40 max-w-[90vw]"
                                                    >
                                                        <input
                                                            type="time"
                                                            autoFocus
                                                            value={draft.startTime || ""}
                                                            onChange={(e) => updateDraft(owner._id, "startTime", e.target.value)}
                                                            className="w-full border border-slate-200 rounded px-2 py-1 text-sm mb-2"
                                                        />
                                                        <div className="flex gap-1">
                                                            <button
                                                                onClick={() => updateDraft(owner._id, "startTime", "")}
                                                                className="flex-1 text-xs bg-slate-100 rounded py-1"
                                                            >
                                                                Clear
                                                            </button>
                                                            <button
                                                                onClick={() => setEditingCell(null)}
                                                                className="flex-1 text-xs bg-red-50 text-red-600 rounded py-1"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                onClick={() => handleSave(owner._id)}
                                                                disabled={saving}
                                                                className="flex-1 text-xs bg-green-50 text-green-700 rounded py-1"
                                                            >
                                                                Save
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </td>

                                            {/* Pigeon time slots */}
                                            {Array.from({ length: totalSlots }).map((_, idx) => (
                                                <td
                                                    key={idx}
                                                    onClick={() => openCell(owner._id, "times", idx)}
                                                    className="px-2 py-3 text-center cursor-pointer hover:bg-slate-50 relative"
                                                >
                                                    {draft.times[idx] || "—"}
                                                    {editingCell?.ownerId === owner._id &&
                                                        editingCell?.field === "times" &&
                                                        editingCell?.index === idx && (
                                                            <div
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="absolute z-20 top-full left-0 bg-white border-2 border-[#0ea5e9] rounded-lg p-3 shadow-lg w-40 max-w-[90vw]"
                                                            >
                                                                <input
                                                                    type="time"
                                                                    autoFocus
                                                                    value={draft.times[idx] || ""}
                                                                    onChange={(e) => updateDraft(owner._id, "times", e.target.value, idx)}
                                                                    className="w-full border border-slate-200 rounded px-2 py-1 text-sm mb-2"
                                                                />
                                                                <div className="flex gap-1">
                                                                    <button
                                                                        onClick={() => updateDraft(owner._id, "times", "", idx)}
                                                                        className="flex-1 text-xs bg-slate-100 rounded py-1"
                                                                    >
                                                                        Clear
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setEditingCell(null)}
                                                                        className="flex-1 text-xs bg-red-50 text-red-600 rounded py-1"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleSave(owner._id)}
                                                                        disabled={saving}
                                                                        className="flex-1 text-xs bg-green-50 text-green-700 rounded py-1"
                                                                    >
                                                                        Save
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                </td>
                                            ))}

                                            <td className="px-3 py-3 text-center font-bold text-[#122654]">
                                                {existing?.total || "00:00:00"}
                                            </td>
                                            <td className="px-3 py-3 text-center">
                                                <button
                                                    onClick={() => handleSave(owner._id)}
                                                    disabled={saving}
                                                    className="text-xs bg-[#0ea5e9] text-white px-3 py-1.5 rounded hover:bg-[#0284c7]"
                                                >
                                                    Save Row
                                                </button>
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