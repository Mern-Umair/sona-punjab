import { useState, useEffect, useRef } from "react";
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

function StampIcon() {
  return <span title="Double Stamp" className="ml-1 text-[10px]">🏷️</span>;
}

// Small inline icons — no new dependency needed
function HouseIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5L12 3l9 7.5M5 9.5V21h14V9.5" />
    </svg>
  );
}
function ArrowDownIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v14m0 0l-5-5m5 5l5-5" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" />
    </svg>
  );
}

function TournamentBlock({ tournament }) {
  const dates = tournament.dates || [];
  const [activeTab, setActiveTab] = useState(0);
  const isTotal = activeTab === dates.length;
  const isDoubleTotal = activeTab === dates.length + 1;

  const selectedDate =
    !isTotal && !isDoubleTotal && dates[activeTab]
      ? new Date(dates[activeTab]).toISOString().split("T")[0]
      : null;

  const { data: dayData, isLoading: dayLoading } = useGetTournamentByDayQuery(
    { id: tournament._id, date: selectedDate },
    { skip: !selectedDate }
  );

  const { data: totalData, isLoading: totalLoading } = useGetTournamentTotalQuery(
    tournament._id,
    { skip: !isTotal && !isDoubleTotal }
  );

  const dayResults = dayData?.data?.day?.results || [];
  const totalResults = totalData?.data?.totalResults || [];
  const doubleStampResults = totalData?.data?.doubleStampResults || [];
  const dayStats = dayData?.data?.day || {};
  const isLoading = dayLoading || totalLoading;

  const results = isDoubleTotal ? doubleStampResults : isTotal ? totalResults : dayResults;
  const pigeons = tournament.pigeons || 3;

  const totalPigeonSlots =
    ((tournament.pigeons || 0) + (tournament.helperPigeons || 0)) *
    (tournament.owners?.length || 0);

  const landed = isTotal || isDoubleTotal
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

  const totalDateCols = (isTotal || isDoubleTotal)
    ? dates.map((d) => formatDate(d))
    : [];

  // "Last Winner" = highest individual clock-time cell across all owners, for the current day
  const lastWinnerPigeon = (() => {
    if (isTotal || isDoubleTotal) return null;
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

  // "First Winner" = lowest/earliest individual clock-time cell across all owners, for the current day
  const firstWinnerPigeon = (() => {
    if (isTotal || isDoubleTotal) return null;
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
        if (!best || mins < best.minutes) {
          best = { ownerId: String(owner._id), colIndex: ti, time: t, minutes: mins, ownerName: owner.name };
        }
      }
    });
    return best;
  })();

  const winningPigeon = lastWinnerPigeon; // kept for existing cell-highlight logic below

  // --- Blink-on-new-record logic ---
  const [blinkingRows, setBlinkingRows] = useState({});
  const lastTotalsRef = useRef({});
  const blinkTimersRef = useRef({});

  const tabKey = isDoubleTotal ? "double" : isTotal ? "total" : selectedDate || "loading";

  useEffect(() => {
    if (isLoading || !tournament.owners) return;

    tournament.owners.forEach((owner) => {
      const matched = results.find(
        (r) => String(r.owner?._id || r.owner) === String(owner._id)
      );
      const currentTotal = matched?.total || null;
      const key = `${tabKey}:${owner._id}`;
      const prevTotal = lastTotalsRef.current[key];

      if (currentTotal && prevTotal !== undefined && prevTotal !== currentTotal) {
        setBlinkingRows((prev) => ({ ...prev, [owner._id]: true }));
        if (blinkTimersRef.current[owner._id]) clearTimeout(blinkTimersRef.current[owner._id]);
        blinkTimersRef.current[owner._id] = setTimeout(() => {
          setBlinkingRows((prev) => {
            const next = { ...prev };
            delete next[owner._id];
            return next;
          });
        }, 3000);
      }

      lastTotalsRef.current[key] = currentTotal;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results, isLoading, tabKey]);

  useEffect(() => {
    return () => {
      Object.values(blinkTimersRef.current).forEach(clearTimeout);
    };
  }, []);

  return (
    <section className="w-full mb-1 sm:mb-10">
      <h2 className="text-navy font-heading font-bold text-lg sm:text-3xl text-center py-2 sm:py-5 px-2">
        {tournament.name}
      </h2>

      <div className="flex justify-center items-center gap-1 sm:gap-2 flex-wrap px-2 sm:px-4 pb-2 sm:pb-4">
        {dates.map((date, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            className={`px-2 py-0.5 sm:px-5 sm:py-1.5 text-[9px] sm:text-sm font-sans font-medium rounded border-2 transition-colors
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
          className={`px-2 py-0.5 sm:px-5 sm:py-1.5 text-[9px] sm:text-sm font-sans font-medium rounded border-2 transition-colors
            ${isTotal
              ? "border-navy bg-white text-navy font-bold"
              : "border-navy text-navy bg-white hover:bg-navypale"
            }`}
        >
          Total
        </button>
        <button
          onClick={() => setActiveTab(dates.length + 1)}
          className={`px-2 py-0.5 sm:px-5 sm:py-1.5 text-[9px] sm:text-sm font-sans font-medium rounded border-2 transition-colors
            ${isDoubleTotal
              ? "border-navy bg-navy text-white font-bold"
              : "border-navy text-navy bg-white hover:bg-navypale"
            }`}
        >
          🏷️ Double Stamp Total
        </button>
      </div>

      {/* Info box — same design everywhere, font-size fluid on small screens */}
      <div
        className="mx-2 sm:mx-4 mb-2 sm:mb-3 bg-white border border-gray border-l-4 border-l-cyan-500 rounded shadow-sm px-2 py-1.5 sm:px-4 sm:py-3 text-dark"
        style={{ fontSize: "clamp(9px, 2.4vw, 14px)" }}
      >
        <p>
          Lofts: <strong>{tournament.lofts || tournament.owners?.length || 0}</strong>,
          {" "}Total pigeons: <strong>{totalPigeonSlots}</strong>,
          {" "}Pigeons landed: <strong>{landed}</strong>,
          {" "}Pigeons remaining: <strong>{remaining}</strong>
        </p>
      </div>

      <div className="mx-2 sm:mx-4 overflow-x-auto border border-gray">
        <table className="w-full text-[9px] sm:text-sm font-sans table-fixed sm:table-auto">
          <thead>
            <tr className="bg-navy">
              <th className="pl-1 pr-1 py-1.5 sm:pl-24 sm:pr-3 sm:py-3 text-left text-white font-semibold w-[110px] sm:w-auto">
                Name
              </th>
              {(isTotal || isDoubleTotal)
                ? totalDateCols.map((col, i) => (
                  <th key={i} className="px-0.5 py-1.5 sm:px-3 sm:py-3 text-center text-white font-semibold whitespace-nowrap">{col}</th>
                ))
                : Array.from({ length: pigeons }).map((_, n) => (
                  <th key={n} className="px-0 py-1.5 sm:px-2 sm:py-3 text-center text-white font-semibold w-[32px] sm:w-auto">#{n + 1}</th>
                ))
              }
              <th className="px-0.5 py-1.5 sm:px-3 sm:py-3 text-center text-white font-semibold w-[42px] sm:w-auto">Total</th>
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
                const isBlinking = !!blinkingRows[owner._id];
                const rowBg = isBlinking
                  ? "bg-yellow-200"
                  : i % 2 === 0
                    ? "bg-green-50 sm:bg-white"
                    : "bg-white sm:bg-sky-50";
                return (
                  <tr
                    key={owner._id}
                    className={`border-t border-gray transition-colors hover:bg-cyan-100 ${isBlinking ? "animate-pulse" : ""} ${rowBg}`}
                  >
                    <td className={`px-1 py-1 sm:px-3 sm:py-1.5 ${rowBg}`}>
                      <div className="flex items-center gap-1 sm:gap-3">
                        <span className="text-dark font-bold w-3 sm:w-5 text-center shrink-0 text-[8px] sm:text-sm">{i + 1}</span>
                        {owner.imageUrl ? (
                          <img
                            src={owner.imageUrl}
                            alt={owner.name}
                            className="w-5 h-5 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-gold shrink-0"
                          />
                        ) : (
                          <div className="w-5 h-5 sm:w-14 sm:h-14 rounded-full bg-navypale border-2 border-gold flex items-center justify-center shrink-0">
                            <span className="text-navy text-[7px] sm:text-sm font-bold">
                              {owner.name?.charAt(0) || "?"}
                            </span>
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-navy font-semibold leading-tight text-[8px] sm:text-sm truncate max-w-[70px] sm:max-w-none">{owner.name || "—"}</p>
                          {owner.city && <p className="text-gray text-[7px] sm:text-[11px] truncate max-w-[70px] sm:max-w-none">{owner.city}</p>}
                        </div>
                      </div>
                    </td>

                    {(isTotal || isDoubleTotal)
                      ? dates.map((d, ti) => {
                        const dayIso = new Date(d).toISOString().split("T")[0];
                        const dayObj = tournament.tournamentDays?.find(
                          (day) => new Date(day.date).toISOString().split("T")[0] === dayIso
                        );
                        const dayResult = dayObj?.results?.find(
                          (r) => String(r.owner) === String(owner._id)
                        );
                        if (isDoubleTotal && !dayResult?.isDoubleStamp) {
                          return (
                            <td key={ti} className="px-0.5 py-1.5 sm:py-3 text-center text-gray text-[8px] sm:text-sm">—</td>
                          );
                        }
                        return (
                          <td key={ti} className="px-0.5 py-1.5 sm:py-3 text-center text-gray whitespace-nowrap text-[8px] sm:text-sm">
                            {dayResult?.total || "—"}
                            {dayResult?.isDoubleStamp && <StampIcon />}
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
                            className={`px-0 py-1 sm:px-2 sm:py-1.5 text-center transition-colors whitespace-nowrap text-[7px] sm:text-sm ${isWinningCell
                              ? "bg-pink-400 sm:bg-cyan-600 text-white font-bold"
                              : "text-gray"
                              }`}
                          >

                            {matched?.times?.[ti + 1] || "—"}
                          </td>
                        );
                      })
                    }

                    <td className="px-0.5 py-1 sm:px-3 sm:py-1.5 text-center font-bold text-navy whitespace-nowrap text-[7px] sm:text-sm">
                      {matched?.total || "No Result"}
                      {!isTotal && !isDoubleTotal && matched?.isDoubleStamp && <StampIcon />}
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

  const { data: singleData, isLoading: singleLoading } = useGetTournamentQuery(id, {
    skip: !id,
  });

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
      <div className="py-1 sm:py-4">
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
    <div className="py-1 sm:py-4">
      {filtered.map((t) => (
        <TournamentBlock key={t._id} tournament={t} />
      ))}
    </div>
  );
}