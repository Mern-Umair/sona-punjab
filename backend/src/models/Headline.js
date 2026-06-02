import mongoose from "mongoose";

const headlineSchema = new mongoose.Schema({
  text: { type: String, required: true, maxlength: 2000 },
}, { timestamps: true });

export default mongoose.model("Headline", headlineSchema);