import { Navigate } from "react-router-dom";
import { getAccessToken } from "../api/client";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = getAccessToken();

  if (!token) {
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
}
