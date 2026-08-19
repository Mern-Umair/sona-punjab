import Headline from "../models/Headline.js";
import { successResponse, errorResponse } from "../utils/response.js";

// @GET /api/headlines
export const getHeadlines = async (req, res) => {
  const headlines = await Headline.find().sort({ createdAt: 1 });
  successResponse(res, headlines);
};

// @POST /api/headlines
export const createHeadline = async (req, res) => {
  const { text } = req.body;
  if (!text) return errorResponse(res, "Text required", 400);

  const headline = await Headline.create({ text });
  successResponse(res, headline, "Headline created", 201);
};

// @PUT /api/headlines/:id
export const updateHeadline = async (req, res) => {
  const headline = await Headline.findById(req.params.id);
  if (!headline) return errorResponse(res, "Headline not found", 404);

  headline.text = req.body.text || headline.text;
  await headline.save();

  successResponse(res, headline, "Headline updated");
};

// @DELETE /api/headlines/:id
export const deleteHeadline = async (req, res) => {
  const headline = await Headline.findById(req.params.id);
  if (!headline) return errorResponse(res, "Headline not found", 404);

  await headline.deleteOne();
  successResponse(res, null, "Headline deleted");
};