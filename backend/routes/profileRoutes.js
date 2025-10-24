import express from "express";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "../models/User.js"; // your User model

const router = express.Router();

/**
 * Helper to find user doc by _id or username.
 * Returns a mongoose document for updates.
 */
const findUserDoc = async (identifier) => {
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    const byId = await User.findById(identifier);
    if (byId) return byId;
  }
  return User.findOne({ username: identifier });
};

/**
 * Helper to find user (lean) for reads.
 */
const findUserLean = async (identifier) => {
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    const byId = await User.findById(identifier).lean();
    if (byId) return byId;
  }
  return User.findOne({ username: identifier }).lean();
};

/* ---------- READ user (no password) ---------- */
// GET /api/users/:identifier   (identifier = username or _id)
router.get("/:identifier", async (req, res) => {
  try {
    const user = await findUserLean(req.params.identifier);
    if (!user) return res.status(404).json({ message: "User not found" });
    delete user.password;
    res.json(user);
  } catch (err) {
    console.error("GET /api/users/:identifier", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ---------- PROFILE GET ---------- */
// GET /api/profile/:id
router.get("/profile/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/* ---------- PROFILE UPDATE ---------- */
// PUT /api/profile/:id
router.put("/profile/:id", async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    for (let key in updates) {
      if (key === "password" && updates[key]) {
        user.password = await bcrypt.hash(updates[key], 10);
      } else if (key !== "password") {
        user[key] = updates[key];
      }
    }

    await user.save();
    const userToReturn = { ...user._doc };
    delete userToReturn.password;
    res.status(200).json(userToReturn);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/* ---------- UPDATE profile (alternate) ---------- */
// PUT /api/users/:id  (existing route, keeps username uniqueness check)
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid id" });

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const updates = { ...req.body };

    // username uniqueness check
    if (updates.username && updates.username !== user.username) {
      const conflict = await User.findOne({ username: updates.username });
      if (conflict)
        return res.status(409).json({ message: "Username already taken" });
    }

    // hash password if provided
    if (updates.password && updates.password.trim() !== "") {
      updates.password = await bcrypt.hash(updates.password, 10);
    } else {
      delete updates.password;
    }

    Object.assign(user, updates);
    await user.save();

    const ret = user.toObject();
    delete ret.password;
    res.json(ret);
  } catch (err) {
    console.error("PUT /api/users/:id", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ---------- FAVORITES ---------- */
router.put("/:username/favorites", async (req, res) => {
  const { username } = req.params;
  const { movie, remove } = req.body;

  if (!movie || !movie.id)
    return res.status(400).json({ message: "movie.id required" });

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    const idx = user.favorites.findIndex(
      (m) => String(m.id) === String(movie.id)
    );
    if (remove) {
      if (idx !== -1) user.favorites.splice(idx, 1);
    } else {
      if (idx === -1) user.favorites.unshift(movie);
    }

    await user.save();
    return res.json(user.favorites);
  } catch (err) {
    console.error("PUT favorites", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/:username/favorites", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).lean();
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json(user.favorites || []);
  } catch (err) {
    console.error("GET favorites", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/* ---------- RECENTLY VIEWED ---------- */
router.put("/:username/recentlyViewed", async (req, res) => {
  const { username } = req.params;
  const { movie } = req.body;

  if (!movie || !movie.id)
    return res.status(400).json({ message: "movie.id required" });

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.recentlyViewed = user.recentlyViewed.filter(
      (m) => String(m.id) !== String(movie.id)
    );
    user.recentlyViewed.unshift(movie);
    if (user.recentlyViewed.length > 20)
      user.recentlyViewed = user.recentlyViewed.slice(0, 20);

    await user.save();
    return res.json(user.recentlyViewed);
  } catch (err) {
    console.error("PUT recentlyViewed", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/:username/recentlyViewed", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).lean();
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json(user.recentlyViewed || []);
  } catch (err) {
    console.error("GET recentlyViewed", err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
