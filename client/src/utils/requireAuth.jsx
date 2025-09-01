import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function RequireAuth({ children }) {
  const { userId, loading } = useSelector((s) => s.user);
  if (loading) return null;
  if (!userId) return <Navigate to="/login" replace />;
  return children;
}
