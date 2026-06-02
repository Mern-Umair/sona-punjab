import Club from "../models/Club.js";
import { successResponse, errorResponse } from "../utils/response.js";

// @GET /api/clubs
export const getClubs = async (req, res) => {
  const clubs = await Club.find().sort({ createdAt: -1 });
  successResponse(res, clubs);
};

// @POST /api/clubs
export const createClub = async (req, res) => {
  const { name } = req.body;
  if (!name) return errorResponse(res, "Club name required", 400);

  const exists = await Club.findOne({ name });
  if (exists) return errorResponse(res, "Club already exists", 400);

  const club = await Club.create({ name });
  successResponse(res, club, "Club created", 201);
};

// @PUT /api/clubs/:id
export const updateClub = async (req, res) => {
  const club = await Club.findById(req.params.id);
  if (!club) return errorResponse(res, "Club not found", 404);

  club.name = req.body.name || club.name;
  await club.save();

  successResponse(res, club, "Club updated");
};

// @DELETE /api/clubs/:id
export const deleteClub = async (req, res) => {
  const club = await Club.findById(req.params.id);
  if (!club) return errorResponse(res, "Club not found", 404);

  await club.deleteOne();
  successResponse(res, null, "Club deleted");
};