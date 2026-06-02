import mongoose from "mongoose";

const pigeonOwnerSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  phone:    { type: String, default: "" },
  city:     { type: String, default: "" },
  imageUrl: { type: String, default: "" },
  key:      { type: String, default: "" }, // S3 key
}, { timestamps: true });

export default mongoose.model("PigeonOwner", pigeonOwnerSchema);