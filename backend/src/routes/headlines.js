import express from "express";
import { getHeadlines, createHeadline, updateHeadline, deleteHeadline } from "../controllers/headlineController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.get("/",     getHeadlines);
router.post("/",    protect, adminOnly, createHeadline);
router.put("/:id",  protect, adminOnly, updateHeadline);
router.delete("/:id", protect, adminOnly, deleteHeadline);

export default router;