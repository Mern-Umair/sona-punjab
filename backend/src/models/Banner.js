import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  key:      { type: String, required: true }, // S3 key for deletion
}, { timestamps: true });

export default mongoose.model("Banner", bannerSchema);