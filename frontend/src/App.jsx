import { Routes, Route, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import SignIn from "./pages/SignIn";
import Movies from "./pages/Movies";
import Profile from "./pages/Profile";
import RecentlyViewed from "./pages/RecentlyViewed";
import Navbar from "./Navbar";
import PrivateRoute from "./PrivateRoute";
import { useSelector } from "react-redux";
import MoviePage from "./pages/MoviePage";

function App() {
  const user = useSelector((state) => state.user.user);
  const location = useLocation();

  // Hide Navbar on login & signup pages
  const hideNavbar =
    location.pathname === "/" || location.pathname === "/signup";

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      {!hideNavbar && user && <Navbar />}

      <div className="pt-20">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<SignIn />} />

          {/* Protected routes (only accessible after login) */}
          <Route
            path="/movies"
            element={
              <PrivateRoute>
                <Movies />
              </PrivateRoute>
            }
          />
          <Route
            path="/movie/:id"
            element={
              <PrivateRoute>
                <MoviePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/recently-viewed"
            element={
              <PrivateRoute>
                <RecentlyViewed />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;
