import mongoose from "mongoose";

const movieCommentSchema = new mongoose.Schema({
  movieId: { type: String, required: true },
  username: { type: String, required: true },
  comment: { type: String, required: true },
  rating: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("MovieComment", movieCommentSchema);
