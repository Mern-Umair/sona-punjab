import "dotenv/config";

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import swaggerUi from "swagger-ui-express";
import connectDB from "./config/db.js";
import { swaggerSpec } from "./config/swagger.js";

import authRoutes from "./routes/auth.js";
import bannerRoutes from "./routes/banners.js";
import headlineRoutes from "./routes/headlines.js";
import clubRoutes from "./routes/clubs.js";
import tournamentRoutes from "./routes/tournaments.js";
import ownerRoutes from "./routes/pigeonOwners.js";
import subAdminRoutes from "./routes/subAdmins.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "../public");

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

// Behind nginx / load balancer on AWS
app.set("trust proxy", 1);

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://highflyerpigeons.com",
    "https://www.highflyerpigeons.com",
  ],
  credentials: true,
}));
app.use(express.json());

// Swagger
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/headlines", headlineRoutes);
app.use("/api/clubs", clubRoutes);
app.use("/api/tournaments", tournamentRoutes);
app.use("/api/owners", ownerRoutes);
app.use("/api/subadmins", subAdminRoutes);

// Static website at /
app.use(express.static(publicDir));
// Static admin at /admin
app.use("/admin", express.static(path.join(publicDir, "admin")));

// SPA fallbacks
app.get(/^\/admin(\/.*)?$/, (req, res) => {
  res.sendFile(path.join(publicDir, "admin", "index.html"));
});

app.get(/^(?!\/api).*/, (req, res, next) => {
  if (req.method !== "GET") return next();
  res.sendFile(path.join(publicDir, "index.html"), (err) => {
    if (err) next();
  });
});

app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ success: false, message: err.message });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running (${NODE_ENV}) on port ${PORT}`);
  console.log(`  Website:  /`);
  console.log(`  Admin:    /admin`);
  console.log(`  API:      /api`);
  console.log(`  Swagger:  /api/docs`);
});
