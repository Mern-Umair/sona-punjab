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

function timeToSeconds(t) {
  if (!t) return null;
  const parts = t.split(":").map(Number);
  if (parts.some((n) => Number.isNaN(n))) return null;
  const [h = 0, m = 0, s = 0] = parts;
  return h * 3600 + m * 60 + s;
}

function StampIcon() {
  return (
    <span
      title="Double Stamp"
      className="rt-stamp inline-block rounded px-1 py-px font-semibold leading-none bg-amber-100 text-amber-700 border border-amber-300 whitespace-nowrap"
    >
      D
    </span>
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

  // First winner = highest time in column #1 only
  const firstWinnerPigeon = (() => {
    if (isTotal || isDoubleTotal) return null;
    let best = null;
    tournament.owners?.forEach((owner) => {
      const matched = results.find(
        (r) => String(r.owner?._id || r.owner) === String(owner._id)
      );
      const t = matched?.times?.[0];
      const secs = timeToSeconds(t);
      if (secs === null) return;
      if (!best || secs > best.seconds) {
        best = { ownerId: String(owner._id), colIndex: 0, time: t, seconds: secs, ownerName: owner.name };
      }
    });
    return best;
  })();

  // Last winner = highest time across all pigeon columns for all owners
  const lastWinnerPigeon = (() => {
    if (isTotal || isDoubleTotal) return null;
    let best = null;
    tournament.owners?.forEach((owner) => {
      const matched = results.find(
        (r) => String(r.owner?._id || r.owner) === String(owner._id)
      );
      if (!matched?.times) return;
      for (let ti = 0; ti < pigeons; ti++) {
        const t = matched.times[ti];
        const secs = timeToSeconds(t);
        if (secs === null) continue;
        if (!best || secs > best.seconds) {
          best = { ownerId: String(owner._id), colIndex: ti, time: t, seconds: secs, ownerName: owner.name };
        }
      }
    });
    return best;
  })();

  /** Returns "first", "last" or null for a pigeon cell. */
  const winnerKindForCell = (ownerId, colIndex) => {
    const id = String(ownerId);
    const isFirst =
      firstWinnerPigeon &&
      firstWinnerPigeon.ownerId === id &&
      firstWinnerPigeon.colIndex === colIndex;
    const isLast =
      lastWinnerPigeon &&
      lastWinnerPigeon.ownerId === id &&
      lastWinnerPigeon.colIndex === colIndex;
    if (isFirst) return "first";
    if (isLast) return "last";
    return null;
  };

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

  const isDay = !isTotal && !isDoubleTotal;
  const lofts = tournament.lofts || tournament.owners?.length || 0;
  const colCount = 5 + (isDay ? pigeons : dates.length);

  const ownerResult = (owner) =>
    results.find((r) => String(r.owner?._id || r.owner) === String(owner._id));

  /** Start (fly) time shown next to the name: the owner's own start time for that day, else the tournament's. */
  const startTimeFor = (owner) => {
    const matched = isDay ? ownerResult(owner) : null;
    return matched?.startTime || tournament.startTime || "—";
  };

  const tabClass = (active) =>
    `rt-tab font-sans font-medium rounded border-2 border-navy transition-colors whitespace-nowrap ${
      active ? "bg-navy text-white font-bold" : "bg-white text-navy hover:bg-navypale"
    }`;

  return (
    <section className="w-full mb-2 sm:mb-10">
      <h2 className="rt-title text-navy font-heading font-bold text-center px-2">
        {tournament.name}
      </h2>
      {tournament.startTime && (
        <p className="rt-subtitle text-center text-gray font-sans mb-1 sm:mb-2">
          Start time: <strong className="text-navy">{tournament.startTime}</strong>
        </p>
      )}

      <div className="flex justify-center items-center gap-1 sm:gap-2 flex-wrap px-2 sm:px-4 pb-2 sm:pb-4">
        {dates.map((date, i) => (
          <button key={i} onClick={() => setActiveTab(i)} className={tabClass(activeTab === i)}>
            {formatDate(date)}
          </button>
        ))}
        <button onClick={() => setActiveTab(dates.length)} className={tabClass(isTotal)}>
          Total
        </button>
        <button onClick={() => setActiveTab(dates.length + 1)} className={tabClass(isDoubleTotal)}>
          🏷️ Double Stamp Total
        </button>
      </div>

      {/* Info box: full wording everywhere; each item stays on ONE line (font shrinks on phones) */}
      <div className="rt-info mx-2 sm:mx-4 mb-2 sm:mb-3 bg-white border border-gray border-l-4 border-l-cyan-500 rounded shadow-sm px-2 py-1 sm:px-4 sm:py-3 text-dark overflow-hidden">
        <div className="flex flex-col gap-y-0.5 sm:gap-y-2">
          <p className="whitespace-nowrap">
            Lofts: <strong>{lofts}</strong>, Total pigeons: <strong>{totalPigeonSlots}</strong>,
            {" "}Pigeons landed: <strong>{landed}</strong>, Pigeons remaining: <strong>{remaining}</strong>
          </p>
          {isDay && (
            <>
              <p className="whitespace-nowrap">
                <span className="inline-block bg-cyan-600 text-white font-semibold px-1.5 py-0.5 rounded">
                  First winner pigeon time:{" "}
                  {firstWinnerPigeon ? `${firstWinnerPigeon.time}, ${firstWinnerPigeon.ownerName}` : "No results yet"}
                </span>
              </p>
              <p className="whitespace-nowrap">
                <span className="inline-block bg-green-700 text-white font-semibold px-1.5 py-0.5 rounded">
                  Last winner pigeon time:{" "}
                  {lastWinnerPigeon ? `${lastWinnerPigeon.time}, ${lastWinnerPigeon.ownerName}` : "No results yet"}
                </span>
              </p>
            </>
          )}
        </div>
      </div>

      <div className="mx-2 sm:mx-4 overflow-x-auto">
        <table className="results-table w-full font-sans">
          <thead>
            <tr className="bg-navy text-white">
              <th className="rt-col-sr text-center font-semibold">Sr</th>
              <th className="rt-col-pic text-center font-semibold">Picture</th>
              <th className="rt-col-name text-left font-semibold">Name</th>
              <th className="text-center font-semibold whitespace-nowrap">Start Time</th>
              {isDay
                ? Array.from({ length: pigeons }).map((_, n) => (
                  <th key={n} className="text-center font-semibold whitespace-nowrap">#{n + 1}</th>
                ))
                : totalDateCols.map((col, i) => (
                  <th key={i} className="text-center font-semibold whitespace-nowrap">{col}</th>
                ))}
              <th className="text-center font-semibold whitespace-nowrap">Total</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={colCount} className="text-center py-8">
                  <div className="inline-block w-8 h-8 border-4 border-t-transparent border-navy rounded-full animate-spin" />
                </td>
              </tr>
            ) : !tournament.owners || tournament.owners.length === 0 ? (
              <tr>
                <td colSpan={colCount} className="text-center py-6 text-gray">
                  No results yet.
                </td>
              </tr>
            ) : (
              tournament.owners.map((owner, i) => {
                const matched = ownerResult(owner);
                const isBlinking = !!blinkingRows[owner._id];
                return (
                  <tr
                    key={owner._id}
                    className={`transition-colors ${isBlinking ? "is-blinking animate-pulse bg-yellow-200" : ""}`}
                  >
                    <td className="rt-col-sr text-center text-dark font-bold">{i + 1}</td>
                    <td className="rt-col-pic text-center">
                      {owner.imageUrl ? (
                        <img
                          src={owner.imageUrl}
                          alt={owner.name}
                          className="rt-avatar inline-block rounded-full object-cover border-2 border-blue-500"
                        />
                      ) : (
                        <span className="rt-avatar inline-flex items-center justify-center rounded-full bg-navypale border-2 border-blue-500 text-navy font-bold">
                          {owner.name?.charAt(0) || "?"}
                        </span>
                      )}
                    </td>
                    <td className="rt-col-name">
                      <p className="rt-name text-navy font-semibold leading-tight">{owner.name || "—"}</p>
                      {owner.city && <p className="rt-city text-gray leading-tight">{owner.city}</p>}
                    </td>
                    <td className="text-center text-dark font-semibold whitespace-nowrap">{startTimeFor(owner)}</td>

                    {isDay
                      ? Array.from({ length: pigeons }).map((_, ti) => {
                        const winnerKind = winnerKindForCell(owner._id, ti);
                        const tone =
                          winnerKind === "first"
                            ? "bg-cyan-600 text-white font-semibold animate-winner-blink"
                            : winnerKind === "last"
                              ? "bg-green-700 text-white font-semibold animate-winner-blink-last"
                              : "text-dark font-semibold";
                        return (
                          <td key={ti} className={`text-center whitespace-nowrap transition-colors ${tone}`}>
                            <span className="inline-flex flex-col items-center justify-center gap-0.5">
                              {matched?.times?.[ti] || "—"}
                              {matched?.doubleStamps?.[ti] && matched?.times?.[ti] ? <StampIcon /> : null}
                            </span>
                          </td>
                        );
                      })
                      : dates.map((d, ti) => {
                        const dayIso = new Date(d).toISOString().split("T")[0];
                        const dayObj = tournament.tournamentDays?.find(
                          (day) => new Date(day.date).toISOString().split("T")[0] === dayIso
                        );
                        const dayResult = dayObj?.results?.find(
                          (r) => String(r.owner) === String(owner._id)
                        );
                        if (isDoubleTotal && !dayResult?.isDoubleStamp) {
                          return (
                            <td key={ti} className="text-center text-dark font-semibold">—</td>
                          );
                        }
                        return (
                          <td key={ti} className="text-center text-dark font-semibold whitespace-nowrap">
                            <span className="inline-flex flex-col items-center justify-center gap-0.5">
                              {isDoubleTotal
                                ? (dayResult?.doubleStampTotal || "—")
                                : (dayResult?.total || "—")}
                              {dayResult?.isDoubleStamp && <StampIcon />}
                            </span>
                          </td>
                        );
                      })}

                    <td className="text-center font-bold text-navy whitespace-nowrap">
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

/** Home page: tournaments marked "On Screen". Tournaments tab (all=true): every tournament, same blocks. */
export default function TournamentSection({ clubId, all = false }) {
  const { id } = useParams();

  const { data: singleData, isLoading: singleLoading } = useGetTournamentQuery(id, {
    skip: !id,
  });

  const { data, isLoading } = useGetTournamentsQuery(
    all ? "" : `?screen=${encodeURIComponent("On Screen")}`,
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