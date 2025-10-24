import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import movieRoutes from "./routes/movieRoutes.js";
import movieComments from "./routes/movieComments.js";
import profileRoutes from "./routes/profileRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files (images, movies, etc.)
app.use("/public", express.static(path.join(__dirname, "public")));

// API Routes
app.use("/api/movies", movieRoutes);             // movie details, download, comments
app.use("/api/movieComments", movieComments);    // separate comment handling if needed
app.use("/api/users", userRoutes);               // login, signup, favorites, recentlyViewed
app.use("/api/profile", profileRoutes);          // profile get/update

// Connect MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
