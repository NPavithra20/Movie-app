import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import Navbar from "../Navbar";

export default function RecentlyViewed() {
  const { user } = useSelector((state) => state.user); // stays compatible
  const isDark = useSelector((state) => state.theme.isDark);

  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    if (!user || !user.username) return;

    fetch(
      `http://localhost:5000/api/users/${encodeURIComponent(user.username)}`
    )
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load user");
        return res.json();
      })
      .then((data) => {
        const rv = (data.recentlyViewed || []).map((m) => ({
          id: m.id,
          name: m.name,
          img: m.img,
          route: `/movie/${m.id}`, // normalize route so Link works
        }));
        const fav = (data.favorites || []).map((m) => ({
          id: m.id,
          name: m.name,
          img: m.img,
          route: `/movie/${m.id}`,
        }));
        setRecentlyViewed(rv);
        setFavorites(fav);
      })
      .catch((err) => {
        console.error("Error loading user data:", err);
      });
  }, [user]);

  const toggleFavorite = async (movie) => {
    if (!user || !user.username) return alert("Login to add favorites");

    const isFav = favorites.some((m) => String(m.id) === String(movie.id));

    try {
      // send minimal payload expected by backend
      const payload = {
        movie: { id: movie.id, name: movie.name, img: movie.img },
        remove: isFav,
      };
      const res = await fetch(
        `http://localhost:5000/api/users/${encodeURIComponent(
          user.username
        )}/favorites`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Favorite update failed");
      }

      const updatedFavs = await res.json();
      // normalize updatedFavs to include route
      setFavorites(
        (updatedFavs || []).map((m) => ({
          id: m.id,
          name: m.name,
          img: m.img,
          route: `/movie/${m.id}`,
        }))
      );
    } catch (err) {
      console.error(err);
      alert("Could not update favorites");
    }
  };

  return (
    <div
      className={`min-h-screen ${
        isDark ? "bg-[#0f172a] text-[#dbeafe]" : "bg-[#e0f2fe] text-[#1e3a8a]"
      }`}
    >
      <Navbar />
      <div className="flex flex-wrap justify-center gap-6 px-6 py-6">
        {recentlyViewed.length === 0 ? (
          <p className="text-lg mt-10">No recently viewed movies!</p>
        ) : (
          recentlyViewed.map((movie) => (
            <div
              key={movie.id}
              className={`w-60 text-center rounded-xl shadow-md overflow-hidden ${
                isDark ? "bg-[#1e293b]" : "bg-white"
              }`}
            >
              <img
                src={movie.img}
                alt={movie.name}
                className="w-full h-80 object-cover rounded-t-xl"
              />
              <div className="p-3 flex justify-between items-center">
                <Link to={movie.route}>
                  <button
                    className={`mt-2 px-4 py-2 rounded-md ${
                      isDark
                        ? "bg-blue-600 text-white hover:bg-blue-500"
                        : "bg-blue-400 text-white hover:bg-blue-500"
                    }`}
                  >
                    View Again
                  </button>
                </Link>
                <button
                  onClick={() => toggleFavorite(movie)}
                  className="ml-2 text-xl"
                >
                  {favorites.some((m) => String(m.id) === String(movie.id))
                    ? "❤️"
                    : "🤍"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
