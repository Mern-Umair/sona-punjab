import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  useGetTournamentsQuery,
  useGetTournamentQuery,
  useGetTournamentByDayQuery,
  useGetTournamentTotalQuery,
} from "../../redux/api/tournamentApi";

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
}

function timeToMinutes(t) {
  if (!t) return null;
  const [h, m] = t.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
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

  const totalPigeonSlots =
    ((tournament.pigeons || 0) + (tournament.helperPigeons || 0)) *
    (tournament.owners?.length || 0);

  const landed = isTotal
    ? (() => {
      const ownerSlots = {};
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

  const totalDateCols = isTotal
    ? dates.map((d) => formatDate(d))
    : [];

  // Winning pigeon = highest individual clock-time cell across all owners, for the current day
  const winningPigeon = (() => {
    if (isTotal) return null;
    let best = null;
    tournament.owners?.forEach((owner) => {
      const matched = results.find(
        (r) => String(r.owner?._id || r.owner) === String(owner._id)
      );
      if (!matched?.times) return;
      for (let ti = 0; ti < pigeons; ti++) {
        const t = matched.times[ti + 1];
        const mins = timeToMinutes(t);
        if (mins === null) continue;
        if (!best || mins > best.minutes) {
          best = { ownerId: String(owner._id), colIndex: ti, time: t, minutes: mins, ownerName: owner.name };
        }
      }
    });
    return best;
  })();

  return (
    <section className="w-full mb-10">
      <h2 className="text-navy font-heading font-bold text-2xl sm:text-3xl text-center py-5">
        {tournament.name}
      </h2>

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

      {/* Info box — matches client's reference: light bg, left accent border */}
      <div className="mx-4 mb-3 bg-white border border-gray border-l-4 border-l-cyan-500 rounded shadow-sm px-4 py-3 text-xs sm:text-sm text-dark">
        <p>
          Lofts: <strong>{tournament.lofts || tournament.owners?.length || 0}</strong>,
          {" "}Total pigeons: <strong>{totalPigeonSlots}</strong>,
          {" "}Pigeons landed: <strong>{landed}</strong>,
          {" "}Pigeons remaining: <strong>{remaining}</strong>
        </p>
        {!isTotal && (
          <p className="mt-2">
            Todays winner pigeon time:{" "}
            {winningPigeon ? (
              <>
                <span className="bg-cyan-600 text-white font-bold px-2 py-0.5 rounded">
                  {winningPigeon.time}
                </span>
                {", "}{winningPigeon.ownerName}
              </>
            ) : (
              "No results yet"
            )}
          </p>
        )}
      </div>

      <div className="mx-4 overflow-x-auto border border-gray">
        <table className="w-full text-xs sm:text-sm font-sans min-w-[500px]">
          <thead>
            <tr className="bg-navy">
              <th className="pl-24 sm:pl-28 pr-3 py-3 text-left text-white font-semibold">Name</th>
              {isTotal
                ? totalDateCols.map((col, i) => (
                  <th key={i} className="px-3 py-3 text-center text-white font-semibold whitespace-nowrap">{col}</th>
                ))
                : Array.from({ length: pigeons }).map((_, n) => (
                  <th key={n} className="px-2 py-3 text-center text-white font-semibold">#{n + 1}</th>
                ))
              }
              <th className="px-3 py-3 text-center text-white font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={pigeons + 2} className="text-center py-8">
                  <div className="inline-block w-8 h-8 border-4 border-t-transparent border-navy rounded-full animate-spin" />
                </td>
              </tr>
            ) : !tournament.owners || tournament.owners.length === 0 ? (
              <tr>
                <td colSpan={pigeons + 2} className="text-center py-6 text-gray text-sm">
                  No results yet.
                </td>
              </tr>
            ) : (
              tournament.owners.map((owner, i) => {
                const matched = results.find(
                  (r) => String(r.owner?._id || r.owner) === String(owner._id)
                );
                return (
                  <tr
                    key={owner._id}
                    className={`border-t border-gray transition-colors hover:bg-cyan-100 ${i % 2 === 0 ? "bg-white" : "bg-sky-50"}`}
                  >
                    <td className="px-3 py-1.5">
                      <div className="flex items-center gap-3">
                        <span className="text-dark font-bold w-5 text-center shrink-0">{i + 1}</span>
                        {owner.imageUrl ? (
                          <img
                            src={owner.imageUrl}
                            alt={owner.name}
                            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-gold shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-navypale border-2 border-gold flex items-center justify-center shrink-0">
                            <span className="text-navy text-sm font-bold">
                              {owner.name?.charAt(0) || "?"}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="text-navy font-semibold leading-tight">{owner.name || "—"}</p>
                          {owner.city && <p className="text-gray text-[11px]">{owner.city}</p>}
                        </div>
                      </div>
                    </td>

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
                      : Array.from({ length: pigeons }).map((_, ti) => {
                        const isWinningCell =
                          winningPigeon &&
                          winningPigeon.ownerId === String(owner._id) &&
                          winningPigeon.colIndex === ti;
                        return (
                          <td
                            key={ti}
                            className={`px-2 py-1.5 text-center transition-colors ${isWinningCell
                                ? "bg-cyan-600 text-white font-bold"
                                : "text-gray"
                              }`}
                          >
                            {matched?.times?.[ti + 1] || "—"}
                          </td>
                        );
                      })
                    }

                    <td className="px-3 py-1.5 text-center font-bold text-navy">
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
  const { id } = useParams();

  // Single-tournament view — via /results/:id (click se aaya hua specific tournament)
  const { data: singleData, isLoading: singleLoading } = useGetTournamentQuery(id, {
    skip: !id,
  });

  // Home page view — sirf "On Screen" tournament
  const { data, isLoading } = useGetTournamentsQuery(
    `?screen=${encodeURIComponent("On Screen")}`,
    { skip: !!id }
  );

  if (id) {
    if (singleLoading) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-t-transparent border-navy rounded-full animate-spin" />
        </div>
      );
    }

    const tournament = singleData?.data;

    if (!tournament) {
      return (
        <div className="text-center py-20 text-gray text-sm">
          Tournament not found.
        </div>
      );
    }

    return (
      <div className="py-4">
        <TournamentBlock tournament={tournament} />
      </div>
    );
  }

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