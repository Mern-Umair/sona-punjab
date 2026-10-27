import express from "express";
import { getSubAdmins, createSubAdmin, updateSubAdmin, deleteSubAdmin } from "../controllers/subAdminController.js";
import { protect, adminOnly } from "../middleware/auth.js";
import { uploadSingle } from "../middleware/upload.js";

const router = express.Router();

const setImageFolder = (req, res, next) => {
  req.uploadFolder = "subadmins";
  next();
};

router.get("/",       protect, adminOnly, getSubAdmins);
router.post("/",      protect, adminOnly, setImageFolder, uploadSingle("image"), createSubAdmin);
router.put("/:id",    protect, adminOnly, setImageFolder, uploadSingle("image"), updateSubAdmin);
router.delete("/:id", protect, adminOnly, deleteSubAdmin);

export default router;