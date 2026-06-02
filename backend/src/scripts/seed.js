import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/User.js";

dotenv.config();

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const exists = await User.findOne({ username: "admin" });
  if (exists) {
    console.log("Admin already exists!");
    process.exit();
  }

  await User.create({
    username: "admin",
    password: "admin123",
    role:     "admin",
  });

  console.log("✅ Admin created! username: admin | password: admin123");
  process.exit();
};

seed();