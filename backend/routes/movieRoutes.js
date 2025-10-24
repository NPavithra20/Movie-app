import express from "express";
import Movie from "../models/Movie.js";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Serve static files for downloads (in server.js we’ll expose /movies too)
router.get("/download/:movieId", async (req, res) => {
  try {
    const { movieId } = req.params;
    const movie = await Movie.findOne({
      $or: [
        { movieId },
        { _id: mongoose.Types.ObjectId.isValid(movieId) ? movieId : null },
      ],
    }).lean();

    if (!movie) return res.status(404).json({ message: "Movie not found" });

    if (movie.downloadUrl && movie.downloadUrl.startsWith("http")) {
      // If external URL, redirect
      return res.redirect(movie.downloadUrl);
    }

    // Otherwise serve from local folder (backend/public/movies)
    const filePath = path.join(__dirname, "../public/movies", `${movie.name}.mp4`);
    res.download(filePath, `${movie.name}.mp4`);
  } catch (e) {
    console.error("Download error:", e);
    res.status(500).json({ message: "Error downloading movie" });
  }
});

// seed helper (call once manually or use db seeder) - optional
router.post("/seed", async (req, res) => {
  try {
    const list = req.body.list || [];
    await Movie.deleteMany({});
    await Movie.insertMany(list);
    res.json({ ok: true, inserted: list.length });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "server error" });
  }
});

// GET all movies (optional pagination)
router.get("/", async (req, res) => {
  try {
    const movies = await Movie.find().lean();
    res.json(movies);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "server error" });
  }
});

// GET single movie by movieId
router.get("/:movieId", async (req, res) => {
  try {
    const { movieId } = req.params;
    const movie = await Movie.findOne({
      $or: [
        { movieId },
        { _id: mongoose.Types.ObjectId.isValid(movieId) ? movieId : null },
      ],
    }).lean();
    console.log("GET /api/movies/:movieId ->", movieId, !!movie);
    if (!movie) return res.status(404).json({ message: "not found" });
    res.json(movie);
  } catch (e) {
    console.error("movies#get error", e);
    res.status(500).json({ message: "server error" });
  }
});

// POST comment to movie
router.post("/:movieId/comments", async (req, res) => {
  try {
    const { username, comment, rating } = req.body;
    if (!username || !comment)
      return res.status(400).json({ message: "username & comment required" });
    const movie = await Movie.findOne({ movieId: req.params.movieId });
    if (!movie) return res.status(404).json({ message: "not found" });
    movie.comments.unshift({ username, comment, rating: rating || 0 });
    await movie.save();
    res.json(movie.comments);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "server error" });
  }
});

// GET comments for a movie
router.get("/:movieId/comments", async (req, res) => {
  try {
    const movie = await Movie.findOne({
      $or: [{ movieId: req.params.movieId }, { _id: req.params.movieId }],
    }).lean();
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    return res.json(movie.comments || []);
  } catch (err) {
    console.error("GET comments error", err);
    return res
      .status(500)
      .json({ message: "Error fetching comments", error: err.message });
  }
});

// POST a comment to /api/movies/:movieId/comments
router.post("/:movieId/comments", async (req, res) => {
  try {
    const { username, comment, rating } = req.body;
    const { movieId } = req.params;
    if (!username || !comment)
      return res.status(400).json({ message: "username & comment required" });

    const movie = await Movie.findOne({ $or: [{ movieId }, { _id: movieId }] });
    if (!movie) return res.status(404).json({ message: "Movie not found" });

    movie.comments.unshift({ username, comment, rating: rating || 0 });
    await movie.save();
    return res.json(movie.comments);
  } catch (err) {
    console.error("POST comment error", err);
    return res
      .status(500)
      .json({ message: "Error saving comment", error: err.message });
  }
});

export default router;
