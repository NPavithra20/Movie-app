import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import Navbar from "../Navbar";

export default function Movies() {
  const [search, setSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [favorites, setFavorites] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [movies, setMovies] = useState([]);

  const isDark = useSelector((state) => state.theme.isDark);
  const currentUser = useSelector((state) => state.user.user);

  const genres = ["All", "Animation", "Adventure", "Comedy", "Fantasy"];

  // Fetch movies from backend
  useEffect(() => {
    fetch("http://localhost:5000/api/movies")
      .then((res) => res.json())
      .then((data) => {
        const mapped = (data || []).map((m) => {
          const id = m.movieId ?? m._id ?? m.id;
          return {
            id: String(id),
            name: m.name,
            img: m.img,
            route: `/movie/${id}`,
            genre: m.genre ?? "Other",
          };
        });
        setMovies(mapped);
      })
      .catch((err) => console.error("Error fetching movies:", err));
  }, []);

  // Load user favorites + recentlyViewed
  useEffect(() => {
    if (!currentUser) return;
    fetch(`http://localhost:5000/api/users/${currentUser.username}`)
      .then((res) => res.json())
      .then((data) => {
        setFavorites(data.favorites || []);
        setRecentlyViewed(data.recentlyViewed || []);
      })
      .catch((err) => console.error("Error loading user data:", err));
  }, [currentUser]);

  // Toggle favorite
  const handleToggleFavorite = async (movie) => {
    if (!currentUser) {
      alert("Please login first!");
      return;
    }
    const isFav = favorites.some((m) => String(m.id) === String(movie.id));
    try {
      const payload = {
        movie: { id: movie.id, name: movie.name, img: movie.img },
        remove: isFav,
      };
      const res = await fetch(
        `http://localhost:5000/api/users/${currentUser.username}/favorites`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const updatedFavs = await res.json();
      setFavorites(updatedFavs);
    } catch (err) {
      console.error("Favorite update error:", err);
    }
  };

  // Add to Recently Viewed
  const handleViewMovie = async (movie) => {
    if (!currentUser) return;
    try {
      const payload = {
        movie: { id: movie.id, name: movie.name, img: movie.img },
      };
      const res = await fetch(
        `http://localhost:5000/api/users/${currentUser.username}/recentlyViewed`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const updatedRecently = await res.json();
      setRecentlyViewed(updatedRecently);
    } catch (err) {
      console.error("Recently viewed update error:", err);
    }
  };

  const trendingMovies = recentlyViewed.slice(0, 6);

  const filteredMovies = movies.filter(
    (movie) =>
      movie.name.toLowerCase().includes(search.toLowerCase()) &&
      (selectedGenre === "All" || movie.genre === selectedGenre)
  );

  // Movie Card Component
  const renderMovieCard = (movie, buttonText = "View More") => {
    const isFav = favorites.some((m) => String(m.id) === String(movie.id));
    return (
      <motion.div
        key={movie.id}
        whileHover={{
          scale: 1.1,
          y: -10,
          zIndex: 10,
          transition: { duration: 0.3 },
        }}
        className={`w-60 flex-shrink-0 text-center rounded-xl shadow-md overflow-hidden hover:shadow-lg ${
          isDark ? "bg-[#1e293b]" : "bg-white"
        }`}
      >
        <img
          src={movie.img}
          alt={movie.name}
          className="w-full h-80 object-cover rounded-t-xl"
        />
        <div className="p-3 flex justify-between items-center">
          <Link to={movie.route} onClick={() => handleViewMovie(movie)}>
            <button
              className={`mt-2 px-4 py-2 rounded-md transition-colors duration-300 ${
                isDark
                  ? "bg-blue-600 text-white hover:bg-blue-500"
                  : "bg-blue-400 text-white hover:bg-blue-500"
              }`}
            >
              {buttonText}
            </button>
          </Link>
          <button
            onClick={() => handleToggleFavorite(movie)}
            className="ml-2 text-2xl cursor-pointer"
          >
            {isFav ? "❤️" : "🤍"}
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <div
      className={`min-h-screen transition-all duration-300 ${
        isDark ? "bg-[#0f172a] text-[#dbeafe]" : "bg-[#e0f2fe] text-[#1e3a8a]"
      }`}
    >
      <Navbar />

      <div className="px-6 py-4">
        {/* 🔥 Continuous Trending Slider */}
        {trendingMovies.length > 0 && (
          <>
            <h2
              className={`text-2xl font-bold mb-4 ${
                isDark ? "text-[#93c5fd]" : "text-[#1e3a8a]"
              }`}
            >
              🔥 Top Trending
            </h2>

            <div className="overflow-hidden relative mb-10">
              <motion.div
                className="flex gap-6"
                animate={{ x: ["0%", "-50%"] }}
                transition={{
                  repeat: Infinity,
                  duration: 20,
                  ease: "linear",
                }}
              >
                {/* Duplicate list for seamless loop */}
                {[...trendingMovies, ...trendingMovies].map((movie, index) => (
                  <Link
                    key={index}
                    to={movie.route}
                    onClick={() => handleViewMovie(movie)}
                  >
                    {renderMovieCard(movie, "Watch")}
                  </Link>
                ))}
              </motion.div>
            </div>
          </>
        )}

        {/* Search + Genre */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-6 relative">
          <input
            type="text"
            placeholder="Search movies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full max-w-md border rounded-md p-2 focus:outline-none ${
              isDark
                ? "bg-[#1e293b] border-gray-600 text-white"
                : "bg-white border-gray-300 text-black"
            }`}
          />
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className={`border rounded-md p-2 ${
              isDark
                ? "bg-[#1e293b] border-gray-600 text-white"
                : "bg-white border-gray-300 text-black"
            }`}
          >
            {genres.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        {/* All Movies */}
        <div className="flex flex-wrap justify-center gap-6">
          {filteredMovies.length > 0 ? (
            filteredMovies.map((movie) => renderMovieCard(movie))
          ) : (
            <p className="text-lg mt-6">No movies found</p>
          )}
        </div>
      </div>
    </div>
  );
}
