import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../redux/userSlice";
import axios from "axios";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isDark = useSelector((state) => state.theme.isDark);
  const reduxUser = useSelector((state) => state.user.user);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    if (reduxUser) {
      navigate("/movies", { replace: true });
    }
  }, [reduxUser, navigate]);

  useEffect(() => {
    const savedUsername = localStorage.getItem("rememberedUsername");
    const savedPassword = localStorage.getItem("rememberedPassword");

    if (savedUsername && savedPassword) {
      setUsername(savedUsername);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async () => {
    setError("");

    if (!username || !password) {
      setError("Please enter username and password");
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/api/users/login`, {
        username,
        password,
      });

      if (res.data && res.data.user) {
        const user = res.data.user;
        dispatch(login(user)); // Save in Redux
        localStorage.setItem("loggedInUser", JSON.stringify(user)); // Persist for reload

        if (rememberMe) {
          localStorage.setItem("rememberedUsername", username);
          localStorage.setItem("rememberedPassword", password);
        } else {
          localStorage.removeItem("rememberedUsername");
          localStorage.removeItem("rememberedPassword");
        }

        alert("Login successful!");
        // Navigation handled by useEffect
      } else {
        setError("Invalid login response from server");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 transition-all duration-300 ${
        isDark ? "bg-[#0f172a] text-[#dbeafe]" : "bg-gradient-to-br from-[#2c4e73] to-[#3c6ea6] text-white"
      }`}
    >
      <div
        className={`rounded-xl shadow-lg p-8 w-full max-w-sm text-center transition-colors duration-300 ${
          isDark ? "bg-[#1e3a8a] text-[#dbeafe]" : "bg-white text-[#2c4e73]"
        }`}
      >
        <h2 className={`text-2xl font-bold mb-6 transition-colors duration-300 ${isDark ? "text-[#93c5fd]" : "text-[#2c4e73]"}`}>
          Login
        </h2>

        <input
          type="text"
          placeholder="Enter Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={`w-full mb-4 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors duration-300 ${
            isDark ? "bg-[#0f172a] border-[#2563eb] focus:ring-[#60a5fa] text-[#dbeafe]" : "bg-white border-gray-300 focus:ring-[#3c6ea6] text-gray-800"
          }`}
        />

        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`w-full mb-4 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors duration-300 ${
            isDark ? "bg-[#0f172a] border-[#2563eb] focus:ring-[#60a5fa] text-[#dbeafe]" : "bg-white border-gray-300 focus:ring-[#3c6ea6] text-gray-800"
          }`}
        />

        <label className={`flex items-center mb-4 transition-colors duration-300 ${isDark ? "text-[#dbeafe]" : "text-gray-700"}`}>
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="mr-2 accent-[#3c6ea6]"
          />
          Remember Me
        </label>

        <button
          onClick={handleLogin}
          className={`w-full py-2 rounded-md mb-2 transition-colors duration-300 ${
            isDark ? "bg-[#2563eb] text-white hover:bg-[#1e3a8a]" : "bg-[#3c6ea6] text-white hover:bg-[#2c4e73]"
          }`}
        >
          Login
        </button>

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <button
          onClick={() => navigate("/signup")}
          className={`w-full py-2 rounded-md border transition-colors duration-300 ${
            isDark ? "border-[#60a5fa] text-[#dbeafe] hover:bg-[#2563eb] hover:text-white" : "border-[#3c6ea6] text-[#3c6ea6] hover:bg-[#3c6ea6] hover:text-white"
          }`}
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}

export default Login;
