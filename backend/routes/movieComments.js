import express from "express";
import MovieComment from "../models/MovieComment.js";

const router = express.Router();

// Get comments for a movie
router.get("/:movieId", async (req, res) => {
  try {
    const comments = await MovieComment.find({ movieId: req.params.movieId }).sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: "Error fetching comments", error: err.message });
  }
});

// Add comment
router.post("/add", async (req, res) => {
  const { username, movieId, comment, rating } = req.body;
  if (!username || !movieId || !comment || !rating)
    return res.status(400).json({ message: "All fields are required" });

  try {
    await MovieComment.create({ username, movieId, comment, rating });
    const updatedComments = await MovieComment.find({ movieId }).sort({ createdAt: -1 });
    res.json(updatedComments);
  } catch (err) {
    res.status(500).json({ message: "Error saving comment", error: err.message });
  }
});

export default router;
