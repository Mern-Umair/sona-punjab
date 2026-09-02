import { useState } from "react";
import { Link } from "react-router-dom";
import { useGetTournamentsQuery } from "../../redux/api/tournamentApi";

function TournamentCard({ tournament }) {
    const prizeDetails = tournament.prizeDetails || [];
    const totalResults = tournament.totalResults || [];
    const hasResults = totalResults.length > 0;

    return (
        <div className="border-b border-gray py-6">
            <div className="flex items-start gap-6">
                {/* Poster */}
                <Link to={`/results/${tournament._id}`} className="shrink-0">
                    {tournament.posterUrl ? (
                        <img
                            src={tournament.posterUrl}
                            alt={tournament.name}
                            className="w-32 h-40 sm:w-48 sm:h-56 object-cover rounded hover:opacity-90 transition-opacity"
                        />
                    ) : (
                        <div className="w-32 h-40 sm:w-48 sm:h-56 bg-light border border-gray rounded flex items-center justify-center">
                            <span className="text-gray text-xs">No poster</span>
                        </div>
                    )}
                </Link>

                {/* Title + Date + Table */}
                <div className="min-w-0 flex-1">
                    <Link
                        to={`/results/${tournament._id}`}
                        className="text-sky-600 font-sans font-bold text-lg sm:text-2xl leading-snug hover:underline block"
                    >
                        {tournament.name}
                    </Link>
                    <p className="text-dark text-xs sm:text-sm font-semibold mt-1 mb-3">
                        {(() => {
                            if (!tournament.startDate) return "—";
                            const start = new Date(tournament.startDate);
                            const end = new Date(start.getTime() + Math.max(0, (tournament.days || 1) - 1) * 86400000);
                            const dayMonth = (d) => `${String(d.getDate()).padStart(2, "0")}. ${d.toLocaleDateString("en-GB", { month: "short" })}`;
                            const year = start.getFullYear();
                            return `${dayMonth(start)} - ${dayMonth(end)} ${year}`;
                        })()}
                    </p>

                    <div className="overflow-x-auto">
                        <table className="w-full table-fixed text-xs sm:text-base font-sans">
                            <colgroup>
                                <col style={{ width: "6%" }} />
                                <col style={{ width: "32%" }} />
                                <col style={{ width: "28%" }} />
                                <col style={{ width: "17%" }} />
                                <col style={{ width: "17%" }} />
                            </colgroup>
                            <tbody>
                                {!hasResults ? (
                                    <tr>
                                        <td colSpan={5} className="py-3 text-gray text-xs">
                                            No winner or final results yet. Check back after the tournament.
                                        </td>
                                    </tr>
                                ) : (
                                    totalResults.map((row, i) => (
                                        <tr key={i} className={i % 2 === 0 ? "bg-light" : "bg-white"}>
                                            <td className="py-2 text-dark">{i + 1}</td>
                                            <td className="py-2 text-navy">{row.owner?.name || "—"}</td>
                                            <td className="py-2 text-gray hidden sm:table-cell">{row.owner?.city || ""}</td>
                                            <td className="py-2 text-dark whitespace-nowrap">{row.total || "—"}</td>
                                            <td className="py-2 text-dark whitespace-nowrap">{prizeDetails[i] || "—"}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ClubTournaments({ clubId }) {
    const { data, isLoading } = useGetTournamentsQuery("");
    const tournaments = data?.data || [];

    const filtered = [...tournaments]
        .filter(t => t.club?._id === clubId)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

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
        <div className="w-full px-4 sm:px-8 lg:px-16 py-6 overflow-x-hidden">

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

            {yearFiltered.map(t => (
                <TournamentCard key={t._id} tournament={t} />
            ))}
        </div>
    );
}