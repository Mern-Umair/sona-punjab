import express from "express";
import { getBanners, createBanner, deleteBanner } from "../controllers/bannerController.js";
import { protect, adminOnly } from "../middleware/auth.js";
import { uploadSingle } from "../middleware/upload.js";

const router = express.Router();

const setBannerFolder = (req, res, next) => {
  req.uploadFolder = "banners";
  next();
};



router.get("/", getBanners);

router.post("/", protect, adminOnly, setBannerFolder, uploadSingle("image"), createBanner);
router.delete("/:id", protect, adminOnly, deleteBanner);

export default router;