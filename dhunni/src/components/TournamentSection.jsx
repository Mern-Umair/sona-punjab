import { useState } from "react";
import {
  useGetTournamentsQuery,
  useGetTournamentByDayQuery,
  useGetTournamentTotalQuery,
} from "../../redux/api/tournamentApi";

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
}

function TournamentBlock({ tournament }) {
  const dates = tournament.dates || [];
  const [activeTab, setActiveTab] = useState(0);
  const isTotal = activeTab === dates.length;

  const selectedDate =
    !isTotal && dates[activeTab]
      ? new Date(dates[activeTab]).toISOString().split("T")[0]
      : null;

  const { data: dayData, isLoading: dayLoading } = useGetTournamentByDayQuery(
    { id: tournament._id, date: selectedDate },
    { skip: !selectedDate || isTotal }
  );

  const { data: totalData, isLoading: totalLoading } = useGetTournamentTotalQuery(
    tournament._id,
    { skip: !isTotal }
  );

  const dayResults = dayData?.data?.day?.results || [];
  const totalResults = totalData?.data?.totalResults || [];
  const dayStats = dayData?.data?.day || {};
  const isLoading = dayLoading || totalLoading;

  const results = isTotal ? totalResults : dayResults;
  const pigeons = tournament.pigeons || 3;

  // Stats — client jaisa: total slots = (pigeons + helperPigeons) × lofts count
  const totalPigeonSlots =
    ((tournament.pigeons || 0) + (tournament.helperPigeons || 0)) *
    (tournament.owners?.length || 0);

  const landed = isTotal
    ? (() => {
      const ownerSlots = {}; // ownerId -> Set of distinct pigeon-positions that ever landed
      (tournament.tournamentDays || []).forEach((day) => {
        day.results?.forEach((r) => {
          const ownerId = String(r.owner);
          if (!ownerSlots[ownerId]) ownerSlots[ownerId] = new Set();
          r.times?.forEach((t, idx) => {
            if (t) ownerSlots[ownerId].add(idx);
          });
        });
      });
      return Object.values(ownerSlots).reduce((sum, set) => sum + set.size, 0);
    })()
    : (dayStats.landed || 0);

  const remaining = Math.max(0, totalPigeonSlots - landed);

  // First & Last winner from results
  const firstWinner = results?.[0]?.owner?.name || "No results yet";
  const lastWinner =
    results?.length > 1
      ? results[results.length - 1]?.owner?.name
      : "No results yet";

  // Total columns — for total tab show date columns
  const totalDateCols = isTotal
    ? dates.map((d) => formatDate(d))
    : [];

  return (
    <section className="w-full mb-10">
      {/* Title */}
      <h2 className="text-navy font-heading font-bold text-2xl sm:text-3xl text-center py-5">
        {tournament.name}
      </h2>

      {/* Date Tabs — centered, all in one line */}
      <div className="flex justify-center items-center gap-2 flex-wrap px-4 pb-4">
        {dates.map((date, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            className={`px-5 py-1.5 text-xs sm:text-sm font-sans font-medium rounded border-2 transition-colors
              ${activeTab === i
                ? "border-navy bg-white text-navy font-bold"
                : "border-navy text-navy bg-white hover:bg-navypale"
              }`}
          >
            {formatDate(date)}
          </button>
        ))}
        <button
          onClick={() => setActiveTab(dates.length)}
          className={`px-5 py-1.5 text-xs sm:text-sm font-sans font-medium rounded border-2 transition-colors
            ${isTotal
              ? "border-navy bg-white text-navy font-bold"
              : "border-navy text-navy bg-white hover:bg-navypale"
            }`}
        >
          Total
        </button>
      </div>

      {/* First & Last Winner — only for date tabs not total */}
      {!isTotal && (
        <div className="mx-4 mb-2 bg-yellow-50 border border-yellow-200 rounded px-4 py-2 text-xs sm:text-sm">
          <span className="font-bold text-dark">First winner: </span>
          <span className="text-navy">{firstWinner}</span>
          <span className="mx-2 text-gray">|</span>
          <span className="font-bold text-dark">Last winner: </span>
          <span className="text-navy">{lastWinner}</span>
        </div>
      )}

      {/* Stats Bar */}
      <div className="mx-4 mb-0 bg-navy rounded-t px-4 py-2.5 flex flex-wrap gap-4 justify-center">
        <span className="text-gold text-xs sm:text-sm font-sans font-semibold">
          Lofts: <span className="text-white">{tournament.lofts || tournament.owners?.length || 0}</span>
        </span>
        <span className="text-gold text-xs sm:text-sm font-sans font-semibold">
          Pigeons: <span className="text-white">{totalPigeonSlots}</span>
        </span>
        <span className="text-gold text-xs sm:text-sm font-sans font-semibold">
          Landed: <span className="text-white">{landed}</span>
        </span>
        <span className="text-gold text-xs sm:text-sm font-sans font-semibold">
          Pigeons remaining: <span className="text-white">{remaining}</span>
        </span>
      </div>
      {/* table */}
      <div className="mx-4 overflow-x-auto border border-gray border-t-0">
        <table className="w-full text-xs sm:text-sm font-sans min-w-[500px]">
          <thead>
            <tr className="bg-light border-b border-gray">
              <th className="px-3 py-3 text-left text-dark font-semibold w-10">Sr #</th>
              <th className="px-3 py-3 text-left text-dark font-semibold">Picture</th>
              <th className="px-3 py-3 text-left text-dark font-semibold">Name</th>
              <th className="px-3 py-3 text-center text-dark font-semibold whitespace-nowrap">Flying time</th>
              {isTotal
                ? totalDateCols.map((col, i) => (
                  <th key={i} className="px-3 py-3 text-center text-dark font-semibold whitespace-nowrap">{col}</th>
                ))
                : Array.from({ length: pigeons }).map((_, n) => (
                  <th key={n} className="px-2 py-3 text-center text-dark font-semibold">#{n + 1}</th>
                ))
              }
              <th className="px-3 py-3 text-center text-dark font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={pigeons + 5} className="text-center py-8">
                  <div className="inline-block w-8 h-8 border-4 border-t-transparent border-navy rounded-full animate-spin" />
                </td>
              </tr>
            ) : !tournament.owners || tournament.owners.length === 0 ? (
              <tr>
                <td colSpan={pigeons + 5} className="text-center py-6 text-gray text-sm">
                  No results yet.
                </td>
              </tr>
            ) : (
              tournament.owners.map((owner, i) => {
                const matched = results.find(
                  (r) => String(r.owner?._id || r.owner) === String(owner._id)
                );
                return (
                  <tr key={owner._id} className={`border-t border-gray ${i % 2 === 0 ? "bg-white" : "bg-light"}`}>
                    <td className="px-3 py-3 text-center text-dark font-bold">{i + 1}</td>
                    {/* Picture */}
                    <td className="px-3 py-3">
                      {owner.imageUrl ? (
                        <img
                          src={owner.imageUrl}
                          alt={owner.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-gold"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-navypale border-2 border-gold flex items-center justify-center">
                          <span className="text-navy text-sm font-bold">
                            {owner.name?.charAt(0) || "?"}
                          </span>
                        </div>
                      )}
                    </td>
                    {/* Name + Phone */}
                    <td className="px-3 py-3">
                      <p className="text-navy font-semibold leading-tight">{owner.name || "—"}</p>
                      {owner.phone && (
                        <p className="text-blue-500 text-[10px] underline">{owner.phone}</p>
                      )}
                    </td>
                    {/* Flying time */}
                    <td className="px-3 py-3 text-center text-dark font-semibold">
                      {matched?.startTime || tournament.startTime || "—"}
                    </td>
                    {/* Times columns */}
                    {isTotal
                      ? dates.map((d, ti) => {
                        const dayIso = new Date(d).toISOString().split("T")[0];
                        const dayObj = tournament.tournamentDays?.find(
                          (day) => new Date(day.date).toISOString().split("T")[0] === dayIso
                        );
                        const dayResult = dayObj?.results?.find(
                          (r) => String(r.owner) === String(owner._id)
                        );
                        return (
                          <td key={ti} className="px-2 py-3 text-center text-gray">
                            {dayResult?.total || "—"}
                          </td>
                        );
                      })
                      : Array.from({ length: pigeons }).map((_, ti) => (
                        <td key={ti} className="px-2 py-3 text-center text-gray">
                          {matched?.times?.[ti + 1] || "—"}
                        </td>
                      ))
                    }
                    {/* Total */}
                    <td className="px-3 py-3 text-center font-bold text-navy">
                      {matched?.total || "No Result"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function TournamentSection({ clubId }) {
  const { data, isLoading } = useGetTournamentsQuery(`?screen=${encodeURIComponent("On Screen")}`);
  const tournaments = data?.data || [];

  const filtered = [...tournaments]
    .filter((t) => (clubId ? t.club?._id === clubId : true))
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

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
        No tournaments available.
      </div>
    );
  }

  return (
    <div className="py-4">
      {filtered.map((t) => (
        <TournamentBlock key={t._id} tournament={t} />
      ))}
    </div>
  );
}