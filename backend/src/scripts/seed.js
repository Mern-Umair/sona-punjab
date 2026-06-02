import "dotenv/config";
import dns from "node:dns";
import mongoose from "mongoose";
import User from "../models/User.js";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
    });

    console.log("MongoDB Connected for seed");

    const exists = await User.findOne({ username: "admin" });

    if (exists) {
      console.log("Admin already exists!");
      process.exit(0);
    }

    await User.create({
      username: "admin",
      password: "admin123",
      role: "admin",
    });

    console.log("✅ Admin created! username: admin | password: admin123");
    process.exit(0);
  } catch (error) {
    console.error("Seed Error:", error.message);
    process.exit(1);
  }
};

seed();