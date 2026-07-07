import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { tryRestoreSession } from "../api/client";
import { Skeleton } from "../components/ui/Skeleton";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [status, setStatus] = useState<"loading" | "authed" | "guest">("loading");

  useEffect(() => {
    tryRestoreSession().then((ok) => setStatus(ok ? "authed" : "guest"));
  }, []);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Skeleton className="h-8 w-32" />
      </div>
    );
  }

  if (status === "guest") {
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
}
