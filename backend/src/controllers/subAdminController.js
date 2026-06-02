import User from "../models/User.js";
import { successResponse, errorResponse } from "../utils/response.js";

// @GET /api/subadmins
export const getSubAdmins = async (req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  successResponse(res, users);
};

// @POST /api/subadmins
export const createSubAdmin = async (req, res) => {
  const { username, phone, password, role } = req.body;

  if (!username || !password)
    return errorResponse(res, "Username and password required", 400);

  const exists = await User.findOne({ username });
  if (exists) return errorResponse(res, "Username already taken", 400);

  const user = await User.create({
    username,
    phone:    phone || "",
    password,
    role:     role || "subadmin",
  });

  successResponse(res, {
    id:       user._id,
    username: user.username,
    role:     user.role,
  }, "SubAdmin created", 201);
};

// @PUT /api/subadmins/:id
export const updateSubAdmin = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return errorResponse(res, "User not found", 404);

  user.username = req.body.username || user.username;
  user.phone    = req.body.phone    ?? user.phone;
  user.role     = req.body.role     || user.role;

  if (req.body.password) user.password = req.body.password;

  await user.save();
  successResponse(res, { id: user._id, username: user.username, role: user.role }, "Updated");
};

// @DELETE /api/subadmins/:id
export const deleteSubAdmin = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return errorResponse(res, "User not found", 404);

  if (user.role === "admin")
    return errorResponse(res, "Cannot delete admin", 403);

  await user.deleteOne();
  successResponse(res, null, "SubAdmin deleted");
};