import "dotenv/config"

import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import connectDB from "./config/db.js";
import { swaggerSpec } from "./config/swagger.js";

import authRoutes       from "./routes/auth.js";
import bannerRoutes     from "./routes/banners.js";
import headlineRoutes   from "./routes/headlines.js";
import clubRoutes       from "./routes/clubs.js";
import tournamentRoutes from "./routes/tournaments.js";
import ownerRoutes      from "./routes/pigeonOwners.js";
import subAdminRoutes   from "./routes/subAdmins.js";

connectDB();

const app    = express();
const PORT   = process.env.PORT     || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

app.use(cors());
app.use(express.json());

// Swagger
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use("/api/auth",        authRoutes);
app.use("/api/banners",     bannerRoutes);
app.use("/api/headlines",   headlineRoutes);
app.use("/api/clubs",       clubRoutes);
app.use("/api/tournaments", tournamentRoutes);
app.use("/api/owners",      ownerRoutes);
app.use("/api/subadmins",   subAdminRoutes);

app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ success: false, message: err.message });
});

app.listen(PORT, () => {
  console.log(`Server running (${NODE_ENV})`);
  console.log(`  Listening: 0.0.0.0:${PORT}`);
  console.log(`  Swagger:   http://localhost:${PORT}/api/docs`);
});