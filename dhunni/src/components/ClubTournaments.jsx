import { useState } from "react";
import { useGetTournamentsQuery } from "../../redux/api/tournamentApi";

function formatDate(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
}

function TournamentCard({ tournament }) {
    const owners = tournament.owners || [];
    const prizeDetails = tournament.prizeDetails || [];
    const totalResults = tournament.totalResults || [];
    const pigeons = tournament.pigeons || 0;

    const hasResults = totalResults.length > 0;

    return (
        <div className="bg-white rounded-xl border border-gray mb-6 overflow-hidden">

            {/* Title + Date + Days */}
            <div className="text-center py-4 border-b border-gray">
                <h2 className="text-navy font-heading font-bold text-xl sm:text-2xl">
                    {tournament.name}
                </h2>
                <p className="text-gray text-xs sm:text-sm mt-1">
                    {tournament.startDate
                        ? new Date(tournament.startDate).toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" })
                        : "—"
                    }
                    {" — "}
                    {tournament.days || 0} {tournament.days === 1 ? "day" : "days"}
                </p>
            </div>

            {/* Table */}
            <div className="overflow-x-auto max-w-full -mx-3 px-3 sm:mx-0 sm:px-0">
                <table className="w-full table-fixed text-[11px] sm:text-sm font-sans min-w-[300px]">
                    <colgroup>
                        <col style={{ width: "6%" }} />
                        <col style={{ width: "22%" }} />
                        <col style={{ width: "34%" }} />
                        <col style={{ width: "19%" }} />
                        <col style={{ width: "19%" }} />
                    </colgroup>
                    <thead>
                        <tr className="bg-light border-b border-gray">
                            <th rowSpan={2} className="px-1.5 py-3 text-left text-dark font-semibold align-bottom">#</th>
                            <th rowSpan={2} className="px-1.5 py-3 text-left text-dark font-semibold align-bottom text-[10px] sm:text-sm leading-tight break-words">Tournament</th>
                            <th colSpan={3} className="px-3 py-2 text-center text-dark font-semibold border-l border-gray">
                                Results
                            </th>
                        </tr>
                        <tr className="bg-light border-b border-gray">
                            <th className="px-3 py-1 text-left text-gray text-[10px] font-medium border-l border-gray">NAME</th>
                            <th className="px-3 py-1 text-center text-gray text-[10px] font-medium">TIME</th>
                            <th className="px-3 py-1 text-center text-gray text-[10px] font-medium">PRIZE</th>
                        </tr>
                    </thead>
                    <tbody>
                        {!hasResults ? (
                            <tr className="border-t border-gray">
                                <td className="px-1.5 py-3 text-center text-dark">{1}</td>
                                <td className="px-1.5 py-3">
                                    {tournament.posterUrl ? (
                                        <img
                                            src={tournament.posterUrl}
                                            alt={tournament.name}
                                            className="w-10 h-14 sm:w-24 sm:h-28 object-cover rounded border border-gray"
                                        />
                                    ) : (
                                        <div className="w-10 h-14 sm:w-24 sm:h-28 bg-light border border-gray rounded flex items-center justify-center">
                                            <span className="text-gray text-xs">No poster</span>
                                        </div>
                                    )}
                                </td>
                                <td colSpan={3} className="px-1.5 py-3 text-center text-gray text-xs border-l border-gray">
                                    No winner or final results yet. Check back after the tournament.
                                </td>
                            </tr>
                        ) : (
                            totalResults.map((row, i) => (
                                <tr key={i} className={`border-t border-gray ${i % 2 === 0 ? "bg-white" : "bg-light"}`}>
                                    <td className="px-1.5 py-3 text-center text-dark font-bold">{i + 1}</td>
                                    <td className="px-3 py-4">
                                        {i === 0 && (
                                            tournament.posterUrl ? (
                                                <img
                                                    src={tournament.posterUrl}
                                                    alt={tournament.name}
                                                    className="w-10 h-14 sm:w-24 sm:h-28 object-cover rounded border border-gray"
                                                />
                                            ) : (
                                                <div className="w-10 h-14 sm:w-24 sm:h-28 bg-light border border-gray rounded flex items-center justify-center">
                                                    <span className="text-gray text-xs">No poster</span>
                                                </div>
                                            )
                                        )}
                                    </td>
                                    {/* Name */}
                                    <td className="px-3 py-4 border-l border-gray">
                                        <div className="flex items-center gap-2">
                                            {row.owner?.imageUrl ? (
                                                <img src={row.owner.imageUrl} alt={row.owner.name} className="w-8 h-8 rounded-full object-cover border border-gold" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-navypale border border-gold flex items-center justify-center">
                                                    <span className="text-navy text-xs font-bold">{row.owner?.name?.charAt(0) || "?"}</span>
                                                </div>
                                            )}
                                            <span className="text-navy font-semibold text-xs">{row.owner?.name || "—"}</span>
                                        </div>
                                    </td>
                                    {/* Time */}
                                    <td className="px-1.5 py-3 text-center text-dark font-semibold">
                                        {row.total || "—"}
                                    </td>
                                    {/* Prize */}
                                    <td className="px-1.5 py-3 text-center text-dark">
                                        {prizeDetails[i] || "—"}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer stats */}
            <div className="px-4 py-3 border-t border-gray text-xs text-gray flex flex-wrap gap-3">
                {hasResults ? (
                    <>
                        <span>Winners listed: <strong className="text-dark">{totalResults.length}</strong></span>
                        <span>|</span>
                        <span>Registered: <strong className="text-dark">{owners.length}</strong></span>
                        <span>|</span>
                        <span>Total Prize Pool: <strong className="text-dark">{prizeDetails.filter(Boolean).length > 0 ? prizeDetails.join(", ") : "—"}</strong></span>
                    </>
                ) : (
                    <>
                        <span>Results: <strong className="text-dark">pending</strong></span>
                        <span>|</span>
                        <span>Registered: <strong className="text-dark">{owners.length}</strong></span>
                        <span>|</span>
                        <span>Total Prize Pool: <strong className="text-dark">{prizeDetails.filter(Boolean).length > 0 ? prizeDetails.join(", ") : "—"}</strong></span>
                    </>
                )}
            </div>
        </div>
    );
}

export default function ClubTournaments({ clubId }) {
    const { data, isLoading } = useGetTournamentsQuery("");
    const tournaments = data?.data || [];

    // Sab tournaments is club ke — screen on/off dono
    const filtered = [...tournaments]
        .filter(t => t.club?._id === clubId)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    // Year filter
    const years = [...new Set(filtered.map(t =>
        t.startDate ? new Date(t.startDate).getFullYear() : null
    ).filter(Boolean))].sort((a, b) => b - a);

    const [selectedYear, setSelectedYear] = useState(years[0] || null);

    const yearFiltered = selectedYear
        ? filtered.filter(t => t.startDate && new Date(t.startDate).getFullYear() === selectedYear)
        : filtered;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-t-transparent border-navy rounded-full animate-spin" />
            </div>
        );
    }

    if (filtered.length === 0) {
        return (
            <div className="text-center py-20 text-gray text-sm">
                No tournaments found for this club.
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 overflow-x-hidden">

            {/* Year Filter */}
            {years.length > 0 && (
                <div className="flex justify-center gap-2 mb-6 flex-wrap">
                    {years.map(y => (
                        <button
                            key={y}
                            onClick={() => setSelectedYear(y)}
                            className={`px-5 py-1.5 text-sm font-sans font-medium rounded border-2 transition-colors
                ${selectedYear === y
                                    ? "border-navy bg-navy text-white"
                                    : "border-navy text-navy bg-white hover:bg-navypale"
                                }`}
                        >
                            {y}
                        </button>
                    ))}
                </div>
            )}

            {/* Tournament Cards */}
            {yearFiltered.map(t => (
                <TournamentCard key={t._id} tournament={t} />
            ))}
        </div>
    );
}