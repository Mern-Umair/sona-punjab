import express from "express";
import { getOwners, getOwner, createOwner, updateOwner, deleteOwner } from "../controllers/pigeonOwnerController.js";
import { protect, adminOnly } from "../middleware/auth.js";
import { uploadSingle } from "../middleware/upload.js";

const router = express.Router();

const setOwnerFolder = (req, res, next) => {
  req.uploadFolder = "owners";
  next();
};

router.get("/",       protect, getOwners);
router.get("/:id",    protect, getOwner);
router.post("/",      protect, setOwnerFolder, uploadSingle("image"), createOwner);
router.put("/:id",    protect, setOwnerFolder, uploadSingle("image"), updateOwner);
router.delete("/:id", protect, adminOnly, deleteOwner);

export default router;