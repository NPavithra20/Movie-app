import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "./redux/themeSlice";
import { logout } from "./redux/userSlice";
import { Sun, Moon } from "lucide-react";

function Navbar() {
  const dispatch = useDispatch();
  const isDark = useSelector((state) => state.theme.isDark);
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout()); 
    navigate("/");
  };

  const linkClasses = ({ isActive }) =>
    `px-3 py-1 rounded-md transition-colors duration-200 ${
      isActive ? "bg-yellow-400 text-black" : "hover:bg-white/30 text-white"
    }`;

  return (
    <nav
      className={`flex justify-between items-center px-6 py-3 shadow-md fixed top-0 w-full z-50 transition-colors duration-300 ${
        isDark ? "bg-[#1e3a8a] text-white" : "bg-[#3c6ea6] text-white"
      }`}
    >
      <h1 className="text-xl font-bold">Cartoon Hub</h1>

      <div className="flex items-center gap-4 md:gap-6">
        <NavLink to="/movies" className={linkClasses}>
          Movies
        </NavLink>
        <NavLink to="/recently-viewed" className={linkClasses}>
          Recently Viewed
        </NavLink>
        <NavLink to="/profile" className={linkClasses}>
          Profile
        </NavLink>

        {/* Theme Toggle */}
        <button
          onClick={() => dispatch(toggleTheme())}
          className="bg-white/20 px-3 py-1 rounded-md hover:bg-white/30 transition-colors duration-200"
          aria-label="Toggle Theme"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
          
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="bg-white/20 px-3 py-1 rounded-md hover:bg-white/30 transition-colors duration-200"
          aria-label="Logout"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
