import express from "express";
import { getClubs, createClub, updateClub, deleteClub } from "../controllers/clubController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.get("/",       getClubs);
router.post("/",      protect, adminOnly, createClub);
router.put("/:id",    protect, adminOnly, updateClub);
router.delete("/:id", protect, adminOnly, deleteClub);

export default router;