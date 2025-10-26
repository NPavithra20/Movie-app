import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout, login as setUser } from "../redux/userSlice";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";

export default function Profile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const isDark = useSelector((state) => state.theme.isDark);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const [profile, setProfile] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    password: "",
  });

  const [favorites, setFavorites] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  useEffect(() => {
    if (!user) return;

    console.log(user._id);

    fetch(`${API_URL}/api/profile/${user._id}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("data ", data);
        setProfile({
          name: data.name || "",
          username: data.username || "",
          email: data.email || "",
          phone: data.phone || "",
          password: "",
        });
        setFavorites(data.favorites || []);
        setRecentlyViewed(data.recentlyViewed || []);
      });
  }, [user]);

  const handleChange = (e) => {
    setProfile((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`${API_URL}/api/profile/${user._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Profile updated successfully");
        const updatedUser = { ...data };
        delete updatedUser.password;
        dispatch(setUser(updatedUser));
      } else {
        alert(data.message || "Error updating profile");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  const toggleFavorite = async (movie) => {
    try {
      const isFav = favorites.some((m) => m.id === movie.id);
      const res = await fetch(
        `${API_URL}/api/users/${user.username}/favorites`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ movie, remove: isFav }),
        }
      );
      const updatedFavs = await res.json();
      setFavorites(updatedFavs);
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return <p className="text-center mt-20">Please login first</p>;

  return (
    <div
      className={`min-h-screen ${
        isDark ? "bg-[#0f172a] text-[#dbeafe]" : "bg-[#e0f2fe] text-[#1e3a8a]"
      }`}
    >
      <Navbar />
      <div className="max-w-4xl mx-auto p-6 pt-24 space-y-6">
        <h2 className="text-3xl font-bold mb-4 text-center">Profile</h2>

        {/* Edit Info */}
        <div
          className={`p-6 rounded-xl shadow-md ${
            isDark ? "bg-[#1e293b]" : "bg-white"
          }`}
        >
          <h3 className="text-xl font-semibold mb-4">Edit Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={profile.name}
              onChange={handleChange}
              className={`p-2 rounded-md border ${
                isDark
                  ? "bg-[#0f172a] border-gray-600 text-white"
                  : "bg-white border-gray-300 text-black"
              }`}
            />
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={profile.username}
              onChange={handleChange}
              className={`p-2 rounded-md border ${
                isDark
                  ? "bg-[#0f172a] border-gray-600 text-white"
                  : "bg-white border-gray-300 text-black"
              }`}
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={profile.email}
              onChange={handleChange}
              className={`p-2 rounded-md border ${
                isDark
                  ? "bg-[#0f172a] border-gray-600 text-white"
                  : "bg-white border-gray-300 text-black"
              }`}
            />
            <input
              type="text"
              name="phone"
              placeholder="Phone"
              value={profile.phone}
              onChange={handleChange}
              className={`p-2 rounded-md border ${
                isDark
                  ? "bg-[#0f172a] border-gray-600 text-white"
                  : "bg-white border-gray-300 text-black"
              }`}
            />
            <input
              type="password"
              name="password"
              placeholder="New Password"
              value={profile.password}
              onChange={handleChange}
              className={`p-2 rounded-md border ${
                isDark
                  ? "bg-[#0f172a] border-gray-600 text-white"
                  : "bg-white border-gray-300 text-black"
              }`}
            />
          </div>
          <button
            onClick={handleSave}
            className="mt-4 px-6 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600"
          >
            Save Changes
          </button>
        </div>

        {/* Favorites */}
        <div
          className={`p-6 rounded-xl shadow-md ${
            isDark ? "bg-[#1e293b]" : "bg-white"
          }`}
        >
          <h3 className="text-xl font-semibold mb-4">Favorites</h3>
          {favorites.length === 0 ? (
            <p>No favorites yet</p>
          ) : (
            <div className="flex flex-wrap gap-4">
              {favorites.map((movie) => (
                <div
                  key={movie.id}
                  className="w-36 rounded-md overflow-hidden shadow-md relative"
                >
                  <img
                    src={movie.img}
                    alt={movie.name}
                    className="w-full h-48 object-cover"
                  />
                  <p className="text-center p-2 font-medium">{movie.name}</p>
                  <button
                    onClick={() => toggleFavorite(movie)}
                    className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recently Viewed */}
        <div
          className={`p-6 rounded-xl shadow-md ${
            isDark ? "bg-[#1e293b]" : "bg-white"
          }`}
        >
          <h3 className="text-xl font-semibold mb-4">Recently Watched</h3>
          {recentlyViewed.length === 0 ? (
            <p>No watched history</p>
          ) : (
            <div className="flex flex-wrap gap-4">
              {recentlyViewed.map((movie) => (
                <div
                  key={movie.id}
                  className="w-36 rounded-md overflow-hidden shadow-md"
                >
                  <img
                    src={movie.img}
                    alt={movie.name}
                    className="w-full h-48 object-cover"
                  />
                  <p className="text-center p-2 font-medium">{movie.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Logout */}
        <div className="text-center">
          <button
            onClick={() => {
              dispatch(logout());
              navigate("/login");
            }}
            className="px-6 py-2 rounded-md bg-red-500 text-white hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
