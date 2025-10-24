import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  username: String,
  comment: String,
  rating: Number,
  createdAt: { type: Date, default: Date.now },
});

const movieSchema = new mongoose.Schema({
  movieId: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  img: String,
  trailer: String,
  genre: String,
  description: String,
  comments: [commentSchema],
  downloadUrl: String, // optional download URL
});

export default mongoose.model("Movie", movieSchema);
