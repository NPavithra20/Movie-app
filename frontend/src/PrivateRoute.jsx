import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

function PrivateRoute({ children }) {
  // Use 'user' from Redux instead of currentUser (matches your login slice)
  const currentUser = useSelector((state) => state.user.user);

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default PrivateRoute;
