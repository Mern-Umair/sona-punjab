import express from "express";
import {
  getTournaments, getTournament, getTournamentByDay,
  getTournamentTotal, createTournament, updateTournament,
  deleteTournament, addDayResults, addTotalResults, toggleScreen,
} from "../controllers/tournamentController.js";
import { protect, adminOnly } from "../middleware/auth.js";
import { uploadSingle } from "../middleware/upload.js";

const router = express.Router();

const setPosterFolder = (req, res, next) => {
  req.uploadFolder = "posters";
  next();
};


router.get("/",                   getTournaments);
router.get("/:id",                getTournament);
router.get("/:id/day/:date",      getTournamentByDay);
router.get("/:id/total",          getTournamentTotal);
router.post("/",                  protect, setPosterFolder, uploadSingle("poster"), createTournament);
router.put("/:id",                protect, setPosterFolder, uploadSingle("poster"), updateTournament);
router.delete("/:id",             protect, adminOnly, deleteTournament);
router.post("/:id/results/:date", protect, addDayResults);
router.post("/:id/total-results", protect, addTotalResults);
router.put("/:id/screen",         protect, adminOnly, toggleScreen);

export default router;