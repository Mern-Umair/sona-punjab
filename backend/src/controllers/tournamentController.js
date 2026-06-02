import Tournament from "../models/Tournament.js";
import { deleteFromS3 } from "../services/s3Service.js";
import { successResponse, errorResponse } from "../utils/response.js";

// @GET /api/tournaments
export const getTournaments = async (req, res) => {
  const { club, status, screen } = req.query;

  const query = {};
  if (club)   query.club   = club;
  if (status) query.status = status;
  if (screen) query.screen = screen;

  const tournaments = await Tournament.find(query)
    .populate("club", "name")
    .populate("owners", "name city imageUrl")
    .populate("subadmins", "username role")
    .sort({ createdAt: -1 });

  successResponse(res, tournaments);
};

// @GET /api/tournaments/:id
export const getTournament = async (req, res) => {
  const tournament = await Tournament.findById(req.params.id)
    .populate("club", "name")
    .populate("owners", "name city imageUrl phone")
    .populate("subadmins", "username role")
    .populate("tournamentDays.results.owner", "name city imageUrl")
    .populate("totalResults.owner", "name city imageUrl");

  if (!tournament) return errorResponse(res, "Tournament not found", 404);

  successResponse(res, tournament);
};

// @GET /api/tournaments/:id/day/:date
export const getTournamentByDay = async (req, res) => {
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
      _id:       tournament._id,
      name:      tournament.name,
      club:      tournament.club,
      startTime: tournament.startTime,
      lofts:     tournament.lofts,
      pigeons:   tournament.pigeons,
    },
    day,
  });
};

// @GET /api/tournaments/:id/total
export const getTournamentTotal = async (req, res) => {
  const tournament = await Tournament.findById(req.params.id)
    .populate("club", "name")
    .populate("totalResults.owner", "name city imageUrl phone");

  if (!tournament) return errorResponse(res, "Tournament not found", 404);

  successResponse(res, {
    tournament: {
      _id:       tournament._id,
      name:      tournament.name,
      club:      tournament.club,
      startTime: tournament.startTime,
      lofts:     tournament.lofts,
      pigeons:   tournament.pigeons,
    },
    totalResults: tournament.totalResults,
  });
};

// @POST /api/tournaments
export const createTournament = async (req, res) => {
  const {
    name, club, startDate, startTime,
    days, continueDays, pigeons, helperPigeons,
    prizes, screen, subadmins, owners,
  } = req.body;

  if (!name) return errorResponse(res, "Tournament name required", 400);

  // Generate tournament days array
  const tournamentDays = [];
  if (startDate && days) {
    const start = new Date(startDate);
    const interval = continueDays ? parseInt(continueDays) : 2;
    for (let i = 0; i < parseInt(days); i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i * interval);
      tournamentDays.push({ date, results: [], landed: 0, remaining: parseInt(pigeons) || 0 });
    }
  }

  const tournament = await Tournament.create({
    name,
    club:          club          || null,
    posterUrl:     req.file?.location || "",
    posterKey:     req.file?.key      || "",
    startDate:     startDate     || null,
    startTime:     startTime     || "",
    days:          parseInt(days)          || 1,
    continueDays:  parseInt(continueDays)  || 0,
    pigeons:       parseInt(pigeons)       || 0,
    helperPigeons: parseInt(helperPigeons) || 0,
    prizes:        parseInt(prizes)        || 0,
    screen:        screen        || "Off Screen",
    subadmins:     subadmins     ? JSON.parse(subadmins) : [],
    owners:        owners        ? JSON.parse(owners)    : [],
    tournamentDays,
    status:        "upcoming",
  });

  const populated = await tournament.populate("club", "name");
  successResponse(res, populated, "Tournament created", 201);
};

// @PUT /api/tournaments/:id
export const updateTournament = async (req, res) => {
  const tournament = await Tournament.findById(req.params.id);
  if (!tournament) return errorResponse(res, "Tournament not found", 404);

  if (req.file) {
    if (tournament.posterKey) await deleteFromS3(tournament.posterKey);
    tournament.posterUrl = req.file.location;
    tournament.posterKey = req.file.key;
  }

  const fields = [
    "name", "club", "startDate", "startTime", "days",
    "continueDays", "pigeons", "helperPigeons", "prizes", "screen", "status"
  ];

  fields.forEach(f => {
    if (req.body[f] !== undefined) tournament[f] = req.body[f];
  });

  if (req.body.subadmins) tournament.subadmins = JSON.parse(req.body.subadmins);
  if (req.body.owners)    tournament.owners    = JSON.parse(req.body.owners);

  await tournament.save();

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

  const { results, landed, remaining, winnerTime, winnerOwner } = req.body;

  const dayIndex = tournament.tournamentDays.findIndex(
    (d) => new Date(d.date).toISOString().split("T")[0] === req.params.date
  );

  if (dayIndex === -1) return errorResponse(res, "Date not found", 404);

  tournament.tournamentDays[dayIndex].results     = results     || [];
  tournament.tournamentDays[dayIndex].landed      = landed      || 0;
  tournament.tournamentDays[dayIndex].remaining   = remaining   || 0;
  tournament.tournamentDays[dayIndex].winnerTime  = winnerTime  || "";
  tournament.tournamentDays[dayIndex].winnerOwner = winnerOwner || null;

  // Check if all days have results — update status
  const allDone = tournament.tournamentDays.every(d => d.results.length > 0);
  if (allDone) tournament.status = "done";
  else         tournament.status = "live";

  await tournament.save();

  successResponse(res, tournament.tournamentDays[dayIndex], "Results added");
};

// @POST /api/tournaments/:id/total-results
export const addTotalResults = async (req, res) => {
  const tournament = await Tournament.findById(req.params.id);
  if (!tournament) return errorResponse(res, "Tournament not found", 404);

  tournament.totalResults = req.body.results || [];
  tournament.status       = "done";
  await tournament.save();

  successResponse(res, tournament.totalResults, "Total results saved");
};

// @PUT /api/tournaments/:id/screen
export const toggleScreen = async (req, res) => {
  const tournament = await Tournament.findById(req.params.id);
  if (!tournament) return errorResponse(res, "Tournament not found", 404);

  tournament.screen = tournament.screen === "On Screen" ? "Off Screen" : "On Screen";
  await tournament.save();

  successResponse(res, { screen: tournament.screen }, "Screen toggled");
};