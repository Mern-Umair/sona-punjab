import PigeonOwner from "../models/PigeonOwner.js";
import { deleteFromS3 } from "../services/s3Service.js";
import { successResponse, errorResponse } from "../utils/response.js";

// @GET /api/owners
export const getOwners = async (req, res) => {
  const { search } = req.query;
  const query = search
    ? { name: { $regex: search, $options: "i" } }
    : {};

  const owners = await PigeonOwner.find(query).sort({ createdAt: 1 });
  successResponse(res, owners);
};

// @GET /api/owners/:id
export const getOwner = async (req, res) => {
  const owner = await PigeonOwner.findById(req.params.id);
  if (!owner) return errorResponse(res, "Owner not found", 404);
  successResponse(res, owner);
};

// @POST /api/owners
export const createOwner = async (req, res) => {
  const { name, phone, city } = req.body;
  if (!name) return errorResponse(res, "Name required", 400);

  const owner = await PigeonOwner.create({
    name,
    phone:    phone || "",
    city:     city  || "",
    imageUrl: req.file?.location || "",
    key:      req.file?.key      || "",
  });

  successResponse(res, owner, "Owner created", 201);
};

// @PUT /api/owners/:id
export const updateOwner = async (req, res) => {
  const owner = await PigeonOwner.findById(req.params.id);
  if (!owner) return errorResponse(res, "Owner not found", 404);

  if (req.file) {
    if (owner.key) await deleteFromS3(owner.key);
    owner.imageUrl = req.file.location;
    owner.key      = req.file.key;
  }

  owner.name  = req.body.name  || owner.name;
  owner.phone = req.body.phone ?? owner.phone;
  owner.city  = req.body.city  ?? owner.city;
  await owner.save();

  successResponse(res, owner, "Owner updated");
};

// @DELETE /api/owners/:id
export const deleteOwner = async (req, res) => {
  const owner = await PigeonOwner.findById(req.params.id);
  if (!owner) return errorResponse(res, "Owner not found", 404);

  if (owner.key) await deleteFromS3(owner.key);
  await owner.deleteOne();

  successResponse(res, null, "Owner deleted");
};