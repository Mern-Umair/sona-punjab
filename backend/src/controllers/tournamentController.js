import mongoose from "mongoose";
import Tournament from "../models/Tournament.js";
import { deleteFromS3 } from "../services/s3Service.js";
import { successResponse, errorResponse } from "../utils/response.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const timeToSeconds = (timeStr) => {
  if (!timeStr) return null;
  const [h, m, s = 0] = timeStr.split(":").map(Number);
  return h * 3600 + m * 60 + s;
};

const calculateDuration = (startTime, arrivalTime) => {
  if (!arrivalTime) return null;
  const startSec = timeToSeconds(startTime) || 0;
  const arrivalSec = timeToSeconds(arrivalTime);
  if (arrivalSec === null) return null;

  let diff = arrivalSec - startSec;
  if (diff >= 0) return diff;

  // If arrival is earlier on the clock than fly time, treat it as PM first.
  const pmArrivalSec = arrivalSec + 12 * 3600;
  if (pmArrivalSec < 24 * 3600 && pmArrivalSec > startSec) {
    return pmArrivalSec - startSec;
  }

  // Otherwise assume next-day arrival.
  return diff + 24 * 3600;
};

/** Pass-through normalize; AM/PM is chosen in admin UI before save. */
const convertPmTo24Hour = (timeStr) => {
  if (!timeStr) return timeStr;
  const parts = String(timeStr).trim().split(":").map(Number);
  if (parts.some((n) => Number.isNaN(n)) || parts.length < 2) return timeStr;

  const [h, m, s = 0] = parts;
  if (h < 0 || h > 23 || m > 59 || s > 59) return timeStr;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const formatDuration = (totalSeconds) => {
  if (totalSeconds === null || totalSeconds === undefined) return "00:00:00";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const calculateOwnerTotal = (times, startTime, pigeons, helperPigeons) => {
  const regularTimes = times.slice(0, pigeons);
  const helperTimes = times.slice(pigeons, pigeons + helperPigeons);

  let totalSeconds = 0;

  regularTimes.forEach((t, i) => {
    if (!helperTimes[i]) {
      const dur = calculateDuration(startTime, t);
      if (dur !== null) totalSeconds += dur;
    }
  });

  helperTimes.forEach((t) => {
    const dur = calculateDuration(startTime, t);
    if (dur !== null) totalSeconds += dur;
  });

  return formatDuration(totalSeconds);
};

const normalizeDoubleStamps = (doubleStamps, slotCount) => {
  const stamps = Array.isArray(doubleStamps) ? [...doubleStamps] : [];
  while (stamps.length < slotCount) stamps.push(false);
  return stamps.slice(0, slotCount).map(Boolean);
};

const calculateDoubleStampOwnerTotal = (times, doubleStamps, startTime, pigeons, helperPigeons) => {
  const stamps = normalizeDoubleStamps(doubleStamps, times.length);
  const regularTimes = times.slice(0, pigeons);
  const helperTimes = times.slice(pigeons, pigeons + helperPigeons);

  let totalSeconds = 0;

  regularTimes.forEach((t, i) => {
    if (!helperTimes[i] && stamps[i] && t) {
      const dur = calculateDuration(startTime, t);
      if (dur !== null) totalSeconds += dur;
    }
  });

  helperTimes.forEach((t, i) => {
    if (stamps[pigeons + i] && t) {
      const dur = calculateDuration(startTime, t);
      if (dur !== null) totalSeconds += dur;
    }
  });

  return formatDuration(totalSeconds);
};

// Har owner ke saare saved din ke totals ko jama karta hai, fastest-first sort karta hai
// Har owner ke saare saved din ke totals ko jama karta hai, fastest-first sort karta hai
const recomputeTotalResults = (tournament) => {
  const ownerTotals = {};

  tournament.tournamentDays.forEach((day) => {
    day.results.forEach((r) => {
      const [h = 0, m = 0, s = 0] = (r.total || "00:00:00").split(":").map(Number);
      const seconds = h * 3600 + m * 60 + s;
      const key = String(r.owner);
      ownerTotals[key] = (ownerTotals[key] || 0) + seconds;
    });
  });

  const sorted = Object.entries(ownerTotals)
    .map(([owner, seconds]) => ({ owner, seconds }))
    .sort((a, b) => a.seconds - b.seconds);

  tournament.totalResults = sorted.map((item, index) => ({
    owner: item.owner,
    rank: index + 1,
    times: [],
    total: formatDuration(item.seconds),
  }));
};

// Sirf double-stamp marked times ka total jama karta hai
const recomputeDoubleStampResults = (tournament) => {
  const ownerTotals = {};

  tournament.tournamentDays.forEach((day) => {
    day.results.forEach((r) => {
      const partialTotal = r.doubleStampTotal || calculateDoubleStampOwnerTotal(
        r.times || [],
        r.doubleStamps || [],
        r.startTime,
        tournament.pigeons,
        tournament.helperPigeons
      );
      const [h = 0, m = 0, s = 0] = partialTotal.split(":").map(Number);
      const seconds = h * 3600 + m * 60 + s;
      if (seconds === 0) return;
      const key = String(r.owner);
      ownerTotals[key] = (ownerTotals[key] || 0) + seconds;
    });
  });

  const sorted = Object.entries(ownerTotals)
    .map(([owner, seconds]) => ({ owner, seconds }))
    .sort((a, b) => a.seconds - b.seconds);

  tournament.doubleStampResults = sorted.map((item, index) => ({
    owner: item.owner,
    rank: index + 1,
    times: [],
    total: formatDuration(item.seconds),
  }));
};

// @GET /api/tournaments
/** A sub admin may only see and manage the tournaments assigned to them. */
const isSubAdmin = (req) => req.user?.role === "subadmin";
const isAssigned = (req, tournament) =>
  tournament.subadmins?.some((s) => String(s._id || s) === String(req.user._id));
const canManage = (req, tournament) => !isSubAdmin(req) || isAssigned(req, tournament);

const populateTournamentList = (query) =>
  Tournament.find(query)
    .populate("club", "name")
    .populate("owners", "name city imageUrl phone")
    .populate("subadmins", "username role")
    .populate("totalResults.owner", "name city imageUrl")
    .populate("doubleStampResults.owner", "name city imageUrl")
    .sort({ createdAt: 1 });

export const getTournaments = async (req, res) => {
  const { club, status, screen } = req.query;

  const query = {};
  // Public site + optional auth: subadmins only get assigned tournaments
  if (isSubAdmin(req)) query.subadmins = req.user._id;
  if (club) query.club = club;
  if (status) query.status = status;
  if (screen) query.screen = screen;

  const tournaments = await populateTournamentList(query);
  successResponse(res, tournaments);
};

/** Admin panel list — requires login. Subadmins only see assigned tournaments. */
export const getMyTournaments = async (req, res) => {
  const query = {};
  if (req.user.role === "subadmin") {
    query.subadmins = req.user._id;
  }

  const tournaments = await populateTournamentList(query);
  successResponse(res, tournaments);
};

// @GET /api/tournaments/:id
export const getTournament = async (req, res) => {
  if (!isValidId(req.params.id)) return errorResponse(res, "Tournament not found", 404);

  const tournament = await Tournament.findById(req.params.id)
    .populate("club", "name")
    .populate("owners", "name city imageUrl phone")
    .populate("subadmins", "username role")
    .populate("tournamentDays.results.owner", "name city imageUrl phone")
    .populate("totalResults.owner", "name city imageUrl")
    .populate("doubleStampResults.owner", "name city imageUrl");

  if (!tournament) return errorResponse(res, "Tournament not found", 404);
  if (!canManage(req, tournament)) return errorResponse(res, "Not your tournament", 403);

  successResponse(res, tournament);
};

// @GET /api/tournaments/:id/day/:date
export const getTournamentByDay = async (req, res) => {
  if (!isValidId(req.params.id)) return errorResponse(res, "Tournament not found", 404);

  const tournament = await Tournament.findById(req.params.id)
    .populate("club", "name")
    .populate("tournamentDays.results.owner", "name city imageUrl phone");

  if (!tournament) return errorResponse(res, "Tournament not found", 404);

  const day = tournament.tournamentDays.find(
    (d) => new Date(d.date).toISOString().split("T")[0] === req.params.date
  );

  if (!day) return errorResponse(res, "No results for this date", 404);

  successResponse(res, {
    tournament: {
      _id: tournament._id,
      name: tournament.name,
      club: tournament.club,
      startTime: tournament.startTime,
      lofts: tournament.lofts,
      pigeons: tournament.pigeons,
    },
    day,
  });
};

// @GET /api/tournaments/:id/total
export const getTournamentTotal = async (req, res) => {
  if (!isValidId(req.params.id)) return errorResponse(res, "Tournament not found", 404);

  const tournament = await Tournament.findById(req.params.id)
    .populate("club", "name")
    .populate("totalResults.owner", "name city imageUrl phone")
    .populate("doubleStampResults.owner", "name city imageUrl phone");

  if (!tournament) return errorResponse(res, "Tournament not found", 404);

  successResponse(res, {
    tournament: {
      _id: tournament._id,
      name: tournament.name,
      club: tournament.club,
      startTime: tournament.startTime,
      lofts: tournament.lofts,
      pigeons: tournament.pigeons,
    },
    totalResults: tournament.totalResults,
    doubleStampResults: tournament.doubleStampResults,
  });
};

// @POST /api/tournaments
export const createTournament = async (req, res) => {
  const {
    name, club, startDate, startTime,
    days, continueDays, pigeons, helperPigeons,
    prizes, screen, subadmins, owners,
    dates, prizeDetails,
  } = req.body;

  if (!name) return errorResponse(res, "Tournament name required", 400);

  // Parse dates array
  let parsedDates = [];
  if (dates) {
    parsedDates = JSON.parse(dates).filter(d => d);
  }

  // Parse prize details
  let parsedPrizes = [];
  if (prizeDetails) {
    parsedPrizes = JSON.parse(prizeDetails).filter(p => p);
  }

  // Generate tournament days
  const tournamentDays = parsedDates.map(date => ({
    date: new Date(date),
    results: [],
    landed: 0,
    remaining: parseInt(pigeons) || 0,
  }));

  // A sub admin who creates a tournament is always assigned to it
  const assignedSubAdmins = subadmins ? JSON.parse(subadmins) : [];
  if (isSubAdmin(req) && !assignedSubAdmins.some((id) => String(id) === String(req.user._id))) {
    assignedSubAdmins.push(req.user._id);
  }

  const tournament = await Tournament.create({
    name,
    club: club || null,
    posterUrl: req.file?.location || "",
    posterKey: req.file?.key || "",
    startDate: startDate || null,
    startTime: startTime || "",
    days: parseInt(days) || 1,
    continueDays: parseInt(continueDays) || 0,
    pigeons: parseInt(pigeons) || 0,
    helperPigeons: parseInt(helperPigeons) || 0,
    prizes: parseInt(prizes) || 0,
    prizeDetails: parsedPrizes,
    dates: parsedDates,
    screen: screen || "Off Screen",
    subadmins: assignedSubAdmins,
    owners: owners ? JSON.parse(owners) : [],
    tournamentDays,
    lofts: owners ? JSON.parse(owners).length : 0,
    status: "upcoming",
  });

  const populated = await tournament.populate("club", "name");

  if (tournament.screen === "On Screen") {
    await Tournament.updateMany(
      { _id: { $ne: tournament._id } },
      { screen: "Off Screen" }
    );
  }

  successResponse(res, populated, "Tournament created", 201);
};
// @PUT /api/tournaments/:id
export const updateTournament = async (req, res) => {
  const tournament = await Tournament.findById(req.params.id);
  if (!tournament) return errorResponse(res, "Tournament not found", 404);
  if (!canManage(req, tournament)) return errorResponse(res, "Not your tournament", 403);

  if (req.file) {
    if (tournament.posterKey) await deleteFromS3(tournament.posterKey);
    tournament.posterUrl = req.file.location;
    tournament.posterKey = req.file.key;
  }

  // Subadmins may only update results via result endpoints — not tournament settings
  if (isSubAdmin(req)) {
    return errorResponse(res, "Sub admins can only manage results for assigned tournaments", 403);
  }

  const fields = [
    "name", "club", "startDate", "startTime", "days",
    "continueDays", "pigeons", "helperPigeons", "prizes", "screen", "status"
  ];

  // Dates update
  if (req.body.dates) {
    const parsedDates = JSON.parse(req.body.dates).filter(d => d);
    tournament.dates = parsedDates;
    tournament.tournamentDays = parsedDates.map(date => ({
      date: new Date(date),
      results: [],
      landed: 0,
      remaining: parseInt(req.body.pigeons || tournament.pigeons) || 0,
    }));
  }

  // Prize details update
  if (req.body.prizeDetails) {
    tournament.prizeDetails = JSON.parse(req.body.prizeDetails).filter(p => p);
  }

  fields.forEach(f => {
    if (req.body[f] !== undefined) tournament[f] = req.body[f];
  });

  if (req.body.subadmins) tournament.subadmins = JSON.parse(req.body.subadmins);
  if (req.body.owners) {
    tournament.owners = JSON.parse(req.body.owners);
    tournament.lofts = tournament.owners.length;
  }

  await tournament.save();

  if (tournament.screen === "On Screen") {
    await Tournament.updateMany(
      { _id: { $ne: tournament._id } },
      { screen: "Off Screen" }
    );
  }

  successResponse(res, tournament, "Tournament updated");
};

// @DELETE /api/tournaments/:id
export const deleteTournament = async (req, res) => {
  const tournament = await Tournament.findById(req.params.id);
  if (!tournament) return errorResponse(res, "Tournament not found", 404);

  if (tournament.posterKey) await deleteFromS3(tournament.posterKey);
  await tournament.deleteOne();

  successResponse(res, null, "Tournament deleted");
};

// @POST /api/tournaments/:id/results/:date
export const addDayResults = async (req, res) => {
  const tournament = await Tournament.findById(req.params.id);
  if (!tournament) return errorResponse(res, "Tournament not found", 404);
  if (!canManage(req, tournament)) return errorResponse(res, "Not your tournament", 403);

  const { results, landed, remaining, winnerTime, winnerOwner } = req.body;

  const dayIndex = tournament.tournamentDays.findIndex(
    (d) => new Date(d.date).toISOString().split("T")[0] === req.params.date
  );

  if (dayIndex === -1) return errorResponse(res, "Date not found", 404);

  tournament.tournamentDays[dayIndex].results = results || [];
  tournament.tournamentDays[dayIndex].landed = landed || 0;
  tournament.tournamentDays[dayIndex].remaining = remaining || 0;
  tournament.tournamentDays[dayIndex].winnerTime = winnerTime || "";
  tournament.tournamentDays[dayIndex].winnerOwner = winnerOwner || null;

  // Check if all days have results — update status
  const allDone = tournament.tournamentDays.every(d => d.results.length > 0);
  if (allDone) tournament.status = "done";
  else tournament.status = "live";

  await tournament.save();

  successResponse(res, tournament.tournamentDays[dayIndex], "Results added");
};

// @POST /api/tournaments/:id/total-results
export const addTotalResults = async (req, res) => {
  const tournament = await Tournament.findById(req.params.id);
  if (!tournament) return errorResponse(res, "Tournament not found", 404);
  if (!canManage(req, tournament)) return errorResponse(res, "Not your tournament", 403);

  tournament.totalResults = req.body.results || [];
  tournament.status = "done";
  await tournament.save();

  successResponse(res, tournament.totalResults, "Total results saved");
};

// @PUT /api/tournaments/:id/screen
export const toggleScreen = async (req, res) => {
  const tournament = await Tournament.findById(req.params.id);
  if (!tournament) return errorResponse(res, "Tournament not found", 404);

  if (tournament.screen === "On Screen") {
    tournament.screen = "Off Screen";
    await tournament.save();
  } else {
    await Tournament.updateMany(
      { _id: { $ne: tournament._id } },
      { screen: "Off Screen" }
    );
    tournament.screen = "On Screen";
    await tournament.save();
  }

  successResponse(res, { screen: tournament.screen }, "Screen toggled");
};

// @PUT /api/tournaments/:id/day/:date/owner-result
export const saveOwnerDayResult = async (req, res) => {
  const tournament = await Tournament.findById(req.params.id);
  if (!tournament) return errorResponse(res, "Tournament not found", 404);
  if (!canManage(req, tournament)) return errorResponse(res, "Not your tournament", 403);

  const { ownerId, times, startTime, doubleStamps } = req.body;
  if (!ownerId || !Array.isArray(times)) {
    return errorResponse(res, "ownerId and times[] required", 400);
  }

  const dayIndex = tournament.tournamentDays.findIndex(
    (d) => new Date(d.date).toISOString().split("T")[0] === req.params.date
  );
  if (dayIndex === -1) return errorResponse(res, "Date not found", 404);

  const finalStartTime = startTime || tournament.startTime;
  const convertedTimes = times.map((t) => convertPmTo24Hour(t, finalStartTime));
  const slotCount = (tournament.pigeons || 0) + (tournament.helperPigeons || 0);
  const normalizedStamps = normalizeDoubleStamps(doubleStamps, slotCount);

  const total = calculateOwnerTotal(
    convertedTimes,
    finalStartTime,
    tournament.pigeons,
    tournament.helperPigeons
  );
  const doubleStampTotal = calculateDoubleStampOwnerTotal(
    convertedTimes,
    normalizedStamps,
    finalStartTime,
    tournament.pigeons,
    tournament.helperPigeons
  );

  const day = tournament.tournamentDays[dayIndex];
  const existingIdx = day.results.findIndex(r => String(r.owner) === String(ownerId));
  const isDoubleStamp = normalizedStamps.some(Boolean);

  if (existingIdx > -1) {
    day.results[existingIdx].times = convertedTimes;
    day.results[existingIdx].startTime = finalStartTime;
    day.results[existingIdx].total = total;
    day.results[existingIdx].doubleStamps = normalizedStamps;
    day.results[existingIdx].doubleStampTotal = doubleStampTotal;
    day.results[existingIdx].isDoubleStamp = isDoubleStamp;
  } else {
    day.results.push({
      owner: ownerId,
      times: convertedTimes,
      startTime: finalStartTime,
      total,
      doubleStamps: normalizedStamps,
      doubleStampTotal,
      isDoubleStamp,
    });
  }

  const totalPigeonSlots = (tournament.pigeons + tournament.helperPigeons) * (tournament.owners?.length || 0);
  day.landed = day.results.reduce((sum, r) => sum + (r.times?.filter(Boolean).length || 0), 0);
  day.remaining = Math.max(0, totalPigeonSlots - day.landed);

  recomputeTotalResults(tournament);
  recomputeDoubleStampResults(tournament);

  await tournament.save();

  const populated = await Tournament.findById(tournament._id)
    .populate("tournamentDays.results.owner", "name city imageUrl phone");

  successResponse(res, populated.tournamentDays[dayIndex], "Result saved");
};