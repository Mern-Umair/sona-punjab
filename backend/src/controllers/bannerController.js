import Banner from "../models/Banner.js";
import { deleteFromS3 } from "../services/s3Service.js";
import { successResponse, errorResponse } from "../utils/response.js";

// @GET /api/banners
export const getBanners = async (req, res) => {
  const banners = await Banner.find().sort({ createdAt: -1 });
  successResponse(res, banners);
};

// @POST /api/banners
export const createBanner = async (req, res) => {
  if (!req.file) return errorResponse(res, "Image required", 400);

  const banner = await Banner.create({
    imageUrl: req.file.location,
    key:      req.file.key,
  });

  successResponse(res, banner, "Banner created", 201);
};

// @DELETE /api/banners/:id
export const deleteBanner = async (req, res) => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) return errorResponse(res, "Banner not found", 404);

  await deleteFromS3(banner.key);
  await banner.deleteOne();

  successResponse(res, null, "Banner deleted");
};