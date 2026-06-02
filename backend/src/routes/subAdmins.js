import express from "express";
import { getSubAdmins, createSubAdmin, updateSubAdmin, deleteSubAdmin } from "../controllers/subAdminController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.get("/",       protect, adminOnly, getSubAdmins);
router.post("/",      protect, adminOnly, createSubAdmin);
router.put("/:id",    protect, adminOnly, updateSubAdmin);
router.delete("/:id", protect, adminOnly, deleteSubAdmin);

export default router;