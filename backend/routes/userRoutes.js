import express from "express";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "../models/User.js";

const router = express.Router();

// Helper to find user (lean) for GET
const findUserLean = async (identifier) => {
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    const byId = await User.findById(identifier).lean();
    if (byId) return byId;
  }
  return User.findOne({ username: identifier }).lean();
};

// GET user by username or id
router.get("/:identifier", async (req, res) => {
  try {
    const user = await findUserLean(req.params.identifier);
    if (!user) return res.status(404).json({ message: "User not found" });
    delete user.password;
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Signup
router.post("/signup", async (req, res) => {
  const { name, username, email, phone, password } = req.body;
  try {
    const exists = await User.findOne({ username });
    if (exists) return res.status(400).json({ message: "Username exists" });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, username, email, phone, password: hashed });

    const userToReturn = { ...newUser._doc };
    delete userToReturn.password;
    res.status(201).json({ message: "User registered", user: userToReturn });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "Invalid username" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Invalid password" });

    const userToReturn = { ...user._doc };
    delete userToReturn.password;
    res.status(200).json({ message: "Login successful", user: userToReturn });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update profile
router.put("/profile/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (updates.password) {
      user.password = await bcrypt.hash(updates.password, 10);
    }
    Object.keys(updates).forEach(key => {
      if (key !== "password") user[key] = updates[key];
    });

    await user.save();
    const ret = user.toObject();
    delete ret.password;
    res.json(ret);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Favorites
router.put("/:username/favorites", async (req, res) => {
  const { username } = req.params;
  const { movie, remove } = req.body;
  if (!movie?.id) return res.status(400).json({ message: "movie.id required" });

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    const idx = user.favorites.findIndex(m => m.id === movie.id);
    if (remove) idx !== -1 && user.favorites.splice(idx, 1);
    else idx === -1 && user.favorites.unshift(movie);

    await user.save();
    res.json(user.favorites);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:username/favorites", async (req, res) => {
  try {
    const user = await User.findOne({ username }).lean();
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.favorites || []);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Recently viewed
router.put("/:username/recentlyViewed", async (req, res) => {
  const { username } = req.params;
  const { movie } = req.body;
  if (!movie?.id) return res.status(400).json({ message: "movie.id required" });

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.recentlyViewed = user.recentlyViewed.filter(m => m.id !== movie.id);
    user.recentlyViewed.unshift(movie);
    if (user.recentlyViewed.length > 20) user.recentlyViewed = user.recentlyViewed.slice(0, 20);

    await user.save();
    res.json(user.recentlyViewed);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:username/recentlyViewed", async (req, res) => {
  try {
    const user = await User.findOne({ username }).lean();
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.recentlyViewed || []);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
