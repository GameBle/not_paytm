import { Navigate } from "react-router-dom";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { Skeleton } from "../components/ui/Skeleton";

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { role, loading } = useCurrentUser();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Skeleton className="h-8 w-32" />
      </div>
    );
  }

  if (role !== "admin") return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}
