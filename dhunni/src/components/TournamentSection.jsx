import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  useGetTournamentsQuery,
  useGetTournamentQuery,
  useGetTournamentByDayQuery,
  useGetTournamentTotalQuery,
} from "../../redux/api/tournamentApi";
import FitRow from "./FitRow";
import FitTable from "./FitTable";

// Tournament dates are stored as the calendar day the organiser typed (a Pakistan date).
// They are always shown as that same day, whatever timezone the visitor is in.
function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${String(d.getUTCDate()).padStart(2, "0")}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${d.getUTCFullYear()}`;
}

/** Today's date in Pakistan as "YYYY-MM-DD", wherever in the world the page is opened. */
function pakistanToday() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const get = (type) => parts.find((p) => p.type === type).value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/** Index of the day to open first: today's date in Pakistan, or the latest day that has already
 * started (the first day before the tournament begins, the last day once it is over). */
function currentDayIndex(dates) {
  const today = pakistanToday();
  let index = 0;
  dates.forEach((d, n) => {
    if (new Date(d).toISOString().slice(0, 10) <= today) index = n;
  });
  return index;
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
      className="rt-stamp inline-block rounded px-1 py-px font-semibold leading-none bg-sky-100 text-sky-700 border border-sky-300 whitespace-nowrap"
    >
      D
    </span>
  );
}

// A pigeon's cell flashes this long after the pigeon landed (several can flash at once)
const FLASH_MS = 5 * 60 * 1000;
// Pigeon times are Pakistan clock times (no daylight saving there)
const PAKISTAN_OFFSET = "+05:00";
// How often an open page asks for new times, so flashes start without a refresh
const REFRESH_MS = 30 * 1000;

function TournamentBlock({ tournament }) {
  const dates = tournament.dates || [];
  const [activeTab, setActiveTab] = useState(() => currentDayIndex(dates));
  const isTotal = activeTab === dates.length;
  const isDoubleTotal = activeTab === dates.length + 1;

  const selectedDate =
    !isTotal && !isDoubleTotal && dates[activeTab]
      ? new Date(dates[activeTab]).toISOString().split("T")[0]
      : null;

  const { data: dayData, isLoading: dayLoading } = useGetTournamentByDayQuery(
    { id: tournament._id, date: selectedDate },
    { skip: !selectedDate, pollingInterval: REFRESH_MS }
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
  const pigeons = tournament.pigeons || 0;
  const helperPigeons = tournament.helperPigeons || 0;
  const totalSlots = pigeons + helperPigeons || 3;

  const totalPigeonSlots =
    totalSlots * (tournament.owners?.length || 0);

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

  // Last winner = highest time across all pigeon columns for all owners.
  // Same time in two columns: the later pigeon (higher number) is the last one.
  const lastWinnerPigeon = (() => {
    if (isTotal || isDoubleTotal) return null;
    let best = null;
    tournament.owners?.forEach((owner) => {
      const matched = results.find(
        (r) => String(r.owner?._id || r.owner) === String(owner._id)
      );
      if (!matched?.times) return;
      for (let ti = 0; ti < totalSlots; ti++) {
        const t = matched.times[ti];
        const secs = timeToSeconds(t);
        if (secs === null) continue;
        if (!best || secs > best.seconds || (secs === best.seconds && ti >= best.colIndex)) {
          best = { ownerId: String(owner._id), colIndex: ti, time: t, seconds: secs, ownerName: owner.name };
        }
      }
    });
    return best;
  })();

  /** The last winner's cell is green and keeps blinking until a later time takes its place
   *  (the first winner shows in the info box only). */
  const isLastWinnerCell = (ownerId, colIndex) =>
    !!lastWinnerPigeon &&
    lastWinnerPigeon.ownerId === String(ownerId) &&
    lastWinnerPigeon.colIndex === colIndex;

  // --- Landing flasher: a pigeon's cell flashes for 5 minutes from the moment it landed
  // (its time, on the selected day, Pakistan clock). Several can flash at once; each has its own 5 minutes.
  const [now, setNow] = useState(() => Date.now());

  /** The moment (epoch ms) a pigeon with this time landed on the selected day; null if unknown. */
  const landedAt = (time) => {
    if (!selectedDate || !time) return null;
    const parts = String(time).split(":");
    if (parts.length < 2 || parts.some((p) => Number.isNaN(Number(p)))) return null;
    const [h, m, sec = "0"] = parts;
    const stamp = Date.parse(
      `${selectedDate}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}${PAKISTAN_OFFSET}`
    );
    return Number.isNaN(stamp) ? null : stamp;
  };
  const isFlashing = (matched, ti) => {
    const at = landedAt(matched?.times?.[ti]);
    return at !== null && now >= at && now < at + FLASH_MS;
  };

  // Re-render when the next flash starts or stops
  useEffect(() => {
    let next = Infinity;
    if (!isTotal && !isDoubleTotal) {
      results.forEach((r) => {
        (r.times || []).forEach((t) => {
          const at = landedAt(t);
          if (at === null) return;
          const edge = at > now ? at : at + FLASH_MS;
          if (edge > now && edge < next) next = edge;
        });
      });
    }
    if (next === Infinity) return;
    const timer = setTimeout(() => setNow(Date.now()), Math.min(next - now + 50, 60 * 1000));
    return () => clearTimeout(timer);
  });

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
  // Name | Start Time (day) | pigeon/date cols | Total
  const colCount = (isDay ? 3 : 2) + (isDay ? totalSlots : dates.length);

  const ownerResult = (owner) =>
    results.find((r) => String(r.owner?._id || r.owner) === String(owner._id));

  /** Start (fly) time shown next to the name: the owner's own start time for that day, else the tournament's. */
  const startTimeFor = (owner) => {
    const matched = isDay ? ownerResult(owner) : null;
    return matched?.startTime || tournament.startTime || "—";
  };

  // Public ranking: the longest total time comes first; owners without a result stay at the
  // bottom in their original order. (The admin result page keeps the fixed entry order.)
  const rankedOwners = (tournament.owners || [])
    .map((owner, position) => ({
      owner,
      position,
      seconds: timeToSeconds(ownerResult(owner)?.total) ?? -1,
    }))
    .sort((a, b) => b.seconds - a.seconds || a.position - b.position)
    .map((entry) => entry.owner);

  const tabClass = (active) =>
    `rt-tab font-sans font-medium rounded transition-colors whitespace-nowrap ${
      active
        ? "border-navy bg-navy text-white font-bold"
        : "border-sky-300 bg-sky-100 text-navy hover:bg-sky-200"
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

      {/* Dates, Total and Double Stamp Total: always one row, shrinks to fit the screen */}
      <FitRow className="px-2 sm:px-4 pb-2 sm:pb-4">
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
      </FitRow>

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
                <span className="inline-block bg-cyan-500 text-white font-semibold px-1.5 py-0.5 rounded">
                  First winner pigeon time:{" "}
                  {firstWinnerPigeon ? `${firstWinnerPigeon.time}, ${firstWinnerPigeon.ownerName}` : "No results yet"}
                </span>
              </p>
              <p className="whitespace-nowrap">
                <span className="inline-block bg-green-600 text-white font-semibold px-1.5 py-0.5 rounded">
                  Last winner pigeon time:{" "}
                  {lastWinnerPigeon ? `${lastWinnerPigeon.time}, ${lastWinnerPigeon.ownerName}` : "No results yet"}
                </span>
              </p>
            </>
          )}
        </div>
      </div>

      {/* Day view (first screen) + Total views (second screens): open layout, tight spacing */}
      <FitTable className="mx-2 sm:mx-4">
        <table className="results-table w-full font-sans">
          <thead>
            <tr>
              <th className="rt-col-name text-left">Name</th>
              {isDay && (
                <th className="text-center whitespace-nowrap">Start Time</th>
              )}
              {isDay
                ? Array.from({ length: totalSlots }).map((_, n) => (
                  <th key={n} className="text-center whitespace-nowrap"># {n + 1}</th>
                ))
                : totalDateCols.map((col, i) => (
                  <th key={i} className="text-center whitespace-nowrap">{col}</th>
                ))}
              <th className="text-center whitespace-nowrap">Total</th>
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
              rankedOwners.map((owner, i) => {
                const matched = ownerResult(owner);
                const isBlinking = !!blinkingRows[owner._id];
                const start = startTimeFor(owner);
                return (
                  <tr
                    key={owner._id}
                    className={`transition-colors ${isBlinking ? "is-blinking animate-pulse bg-yellow-200" : ""}`}
                  >
                    <td className="rt-col-name">
                      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                        <span className="rt-rank text-center">{i + 1}</span>
                        {owner.imageUrl ? (
                          <img
                            src={owner.imageUrl}
                            alt={owner.name}
                            className="rt-avatar rounded-full object-cover"
                          />
                        ) : (
                          <span className="rt-avatar inline-flex items-center justify-center rounded-full bg-slate-200 text-slate-700 font-bold">
                            {owner.name?.charAt(0) || "?"}
                          </span>
                        )}
                        <div className="min-w-0">
                          <p className="rt-name leading-tight">{owner.name || "—"}</p>
                          {owner.city && (
                            <p className="rt-city leading-tight">{owner.city}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {isDay && (
                      <td className="rt-time text-center text-dark font-semibold whitespace-nowrap">
                        {start}
                      </td>
                    )}

                    {isDay
                      ? Array.from({ length: totalSlots }).map((_, ti) => {
                        const tone = isLastWinnerCell(owner._id, ti)
                          ? "bg-green-600 text-white font-semibold animate-winner-blink-last"
                          : isFlashing(matched, ti)
                            ? "bg-amber-300 text-dark font-semibold animate-new-time"
                            : "text-dark font-semibold";
                        return (
                          <td key={ti} className={`rt-time text-center whitespace-nowrap transition-colors ${tone}`}>
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
                            <td key={ti} className="rt-time text-center text-dark font-semibold">—</td>
                          );
                        }
                        return (
                          <td key={ti} className="rt-time text-center text-dark font-semibold whitespace-nowrap">
                            <span className="inline-flex flex-col items-center justify-center gap-0.5">
                              {isDoubleTotal
                                ? (dayResult?.doubleStampTotal || "—")
                                : (dayResult?.total || "—")}
                              {dayResult?.isDoubleStamp && <StampIcon />}
                            </span>
                          </td>
                        );
                      })}

                    <td className="rt-time text-center font-bold text-dark whitespace-nowrap">
                      {matched?.total || "No Result"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </FitTable>
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