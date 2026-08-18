import mongoose from "mongoose";

const resultSchema = new mongoose.Schema({
  owner:     { type: mongoose.Schema.Types.ObjectId, ref: "PigeonOwner" },
  rank:      { type: Number },
  startTime: { type: String, default: "" },
  times:     [{ type: String }],
  total:     { type: String },
}, { _id: false });

const tournamentDaySchema = new mongoose.Schema({
  date:        { type: Date, required: true },
  results:     [resultSchema],
  landed:      { type: Number, default: 0 },
  remaining:   { type: Number, default: 0 },
  winnerTime:  { type: String, default: "" },
  winnerOwner: { type: mongoose.Schema.Types.ObjectId, ref: "PigeonOwner" },
}, { _id: false });

const tournamentSchema = new mongoose.Schema({
  name:          { type: String, required: true },
  club:          { type: mongoose.Schema.Types.ObjectId, ref: "Club" },
  posterUrl:     { type: String, default: "" },
  posterKey:     { type: String, default: "" },
  startDate:     { type: Date },
  startTime:     { type: String },
  days:          { type: Number, default: 1 },
  dates:         [{ type: Date }],        // ← har din ki date
  continueDays:  { type: Number, default: 0 },
  pigeons:       { type: Number, default: 0 },
  helperPigeons: { type: Number, default: 0 },
  prizes:        { type: Number, default: 0 },
  prizeDetails:  [{ type: String }],      // ← har prize ki detail
  lofts:         { type: Number, default: 0 },
  screen:        { type: String, enum: ["On Screen", "Off Screen"], default: "Off Screen" },
  subadmins:     [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  owners:        [{ type: mongoose.Schema.Types.ObjectId, ref: "PigeonOwner" }],
  tournamentDays:[tournamentDaySchema],
  totalResults:  [resultSchema],
  status:        { type: String, enum: ["upcoming", "live", "done"], default: "upcoming" },
}, { timestamps: true });

export default mongoose.model("Tournament", tournamentSchema);