import mongoose from "mongoose";

const clubSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
}, { timestamps: true });

export default mongoose.model("Club", clubSchema);