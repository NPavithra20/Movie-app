import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, Link, useParams } from "react-router-dom";
import Navbar from "../Navbar";

function MoviePage() {
  const { id } = useParams(); // from /movie/:id
  const isDark = useSelector((state) => state.theme.isDark);
  const currentUser = useSelector((state) => state.user.user);
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);

  // ✅ Fetch movie details
  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setLoadingComments(true);

    const fetchMovie = async () => {
      try {
        // try by id
        let res = await fetch(`http://localhost:5000/api/movies/${id}`);
        let data = await res.json();

        // if data invalid, try by movieId query
        if (!res.ok || !data || Object.keys(data).length === 0) {
          const retry = await fetch(
            `http://localhost:5000/api/movies?movieId=${id}`
          );
          data = await retry.json();
          if (Array.isArray(data)) data = data[0];
        }

        if (!data) throw new Error("Movie not found");

        setMovie(data);
        setComments(data.comments || []);
        setLoadingComments(false);

        // fetch all for similar movies
        const allRes = await fetch("http://localhost:5000/api/movies");
        const allMovies = await allRes.json();

        const sims = allMovies.filter(
          (x) =>
            x.genre === data.genre &&
            String(x.movieId ?? x._id ?? x.id) !==
              String(data.movieId ?? data._id ?? data.id)
        );
        setSimilarMovies(sims);
      } catch (err) {
        console.error("Movie fetch error:", err);
      } finally {
        setLoading(false);
        setLoadingComments(false);
      }
    };

    fetchMovie();
  }, [id]);

  // ✅ Track recently viewed
  useEffect(() => {
    if (!movie || !currentUser) return;
    const payload = {
      movie: {
        id: movie.movieId ?? movie._id ?? movie.id,
        name: movie.name,
        img: movie.img,
      },
    };
    fetch(
      `http://localhost:5000/api/users/${currentUser.username}/recentlyViewed`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    ).catch((e) => console.error("recentlyViewed error", e));
  }, [movie, currentUser]);

  // ✅ Comment handler
  const handleAddComment = async () => {
    if (!currentUser) return alert("Please login to comment");
    if (!newComment || rating === 0)
      return alert("Please add comment and rating");

    try {
      const movieId = movie.movieId ?? movie._id ?? movie.id ?? id;
      const res = await fetch(
        `http://localhost:5000/api/movies/${movieId}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: currentUser.username,
            comment: newComment,
            rating,
          }),
        }
      );

      const updated = await res.json();
      if (!res.ok) throw new Error(updated.message || "Failed to post comment");

      setComments(updated);
      setMovie((prev) => (prev ? { ...prev, comments: updated } : prev));
      setNewComment("");
      setRating(0);
    } catch (err) {
      console.error("POST comment error", err);
      alert("Server error while posting comment");
    }
  };

  // ✅ Download handler
  const handleDownload = () => {
    if (!movie) return;
    const movieId = movie.movieId ?? movie._id ?? id;
    window.open(
      `http://localhost:5000/api/movies/download/${movieId}`,
      "_blank"
    );
  };

  // ✅ Favorite handler
  const handleToggleFavorite = async () => {
    if (!currentUser) return alert("Please login to add favorites");
    try {
      const moviePayload = {
        id: movie.movieId ?? movie._id ?? movie.id,
        name: movie.name,
        img: movie.img,
      };
      const isFav = currentUser.favorites?.some(
        (m) => m.id === moviePayload.id
      );

      const res = await fetch(
        `http://localhost:5000/api/users/${currentUser.username}/favorites`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ movie: moviePayload, remove: isFav }),
        }
      );

      const updatedFavs = await res.json();
      alert(isFav ? "Removed from Favorites" : "Added to Favorites");
    } catch (err) {
      console.error(err);
      alert("Error updating favorites");
    }
  };

  const handleBack = () => navigate("/movies");

  // ✅ Render section
  if (loading)
    return (
      <div
        className={`min-h-screen flex justify-center items-center ${
          isDark ? "bg-[#0f172a] text-[#dbeafe]" : "bg-[#e0f2fe] text-[#1e3a8a]"
        }`}
      >
        <p>Loading movie...</p>
      </div>
    );

  if (!movie)
    return (
      <div
        className={`min-h-screen flex justify-center items-center ${
          isDark ? "bg-[#0f172a] text-[#dbeafe]" : "bg-[#e0f2fe] text-[#1e3a8a]"
        }`}
      >
        <p>Movie not found</p>
      </div>
    );

  return (
    <div
      className={`min-h-screen ${
        isDark ? "bg-[#0f172a] text-[#dbeafe]" : "bg-[#e0f2fe] text-[#1e3a8a]"
      }`}
    >
      <Navbar />

      <div className="flex flex-col items-center p-6 pt-20">
        <h2 className="text-3xl font-bold mb-4">{movie.name}</h2>

        <img
          src={movie.img}
          alt={movie.name}
          className="w-72 rounded-xl mb-6 shadow-lg"
        />

        {movie.trailer ? (
          <iframe
            width="560"
            height="315"
            src={movie.trailer}
            title="YouTube trailer"
            allowFullScreen
            className="rounded-xl mb-6"
          ></iframe>
        ) : (
          <p className="mb-6">Trailer not available</p>
        )}

        {movie.downloadUrl && (
          <button
            onClick={handleDownload}
            className="px-6 py-3 mb-6 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Download Movie
          </button>
        )}

        <button
          onClick={handleToggleFavorite}
          className="px-6 py-3 mb-6 bg-pink-600 text-white rounded-md hover:bg-pink-700"
        >
          {currentUser?.favorites?.some(
            (m) => m.id === (movie.movieId ?? movie._id ?? movie.id)
          )
            ? "Remove from Favorites"
            : "Add to Favorites"}
        </button>

        {/* Comments Section */}
        <div className="w-full max-w-xl p-4 rounded-xl shadow-md mb-6 bg-white dark:bg-[#1e293b]">
          <h3 className="text-xl font-semibold mb-2">Add Comment / Rating</h3>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Your comment..."
            className={`w-full p-2 rounded-md mb-2 ${
              isDark
                ? "bg-[#0f172a] border-gray-600 text-white"
                : "bg-gray-100 text-black"
            }`}
          />

          <div className="flex items-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                onClick={() => setRating(star)}
                className={`cursor-pointer text-2xl ${
                  star <= rating ? "text-yellow-400" : "text-gray-400"
                }`}
              >
                ★
              </span>
            ))}
          </div>

          <button
            onClick={handleAddComment}
            className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600"
          >
            Add
          </button>

          <div className="mt-4">
            <h4 className="font-semibold mb-2">All Comments:</h4>
            {loadingComments ? (
              <p>Loading comments...</p>
            ) : comments.length === 0 ? (
              <p>No comments yet</p>
            ) : (
              comments.map((c, i) => (
                <div
                  key={i}
                  className="mb-2 p-2 rounded-md bg-gray-100 dark:bg-[#0f172a]"
                >
                  <p>
                    <strong>{c.username}:</strong> {c.comment}
                  </p>
                  <p>Rating: {c.rating} ★</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Similar Movies */}
        <div className="w-full max-w-4xl">
          <h3 className="text-xl font-semibold mb-4">Similar Movies</h3>
          <div className="flex flex-wrap gap-6">
            {similarMovies.length > 0 ? (
              similarMovies.map((m) => {
                const mid = m.movieId ?? m._id ?? m.id;
                return (
                  <Link key={mid} to={`/movie/${mid}`}>
                    <img
                      src={m.img}
                      alt={m.name}
                      className="w-40 h-56 object-cover rounded-xl hover:shadow-lg"
                    />
                  </Link>
                );
              })
            ) : (
              <p>No similar movies</p>
            )}
          </div>
        </div>

        <button
          onClick={handleBack}
          className="mt-6 px-6 py-3 rounded-md bg-gray-300 hover:bg-gray-400"
        >
          Back
        </button>
      </div>
    </div>
  );
}

export default MoviePage;
