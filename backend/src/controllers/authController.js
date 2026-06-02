import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { successResponse, errorResponse } from "../utils/response.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// @POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return errorResponse(res, "Username and password required", 400);

    const user = await User.findOne({ username });
    if (!user || !(await user.matchPassword(password)))
      return errorResponse(res, "Invalid credentials", 401);

    successResponse(res, {
      token: generateToken(user._id),
      user: {
        id:       user._id,
        username: user.username,
        role:     user.role,
      },
    }, "Login successful");
  } catch (err) {
    errorResponse(res, err.message);
  }
};

// @GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    successResponse(res, req.user);
  } catch (err) {
    errorResponse(res, err.message);
  }
};