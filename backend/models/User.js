import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, unique: true, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  password: { type: String, required: true },
  favorites: { type: Array, default: [] },
  recentlyViewed: { type: Array, default: [] },
});

export default mongoose.model("User", userSchema);
