import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { apiClient } from "../api/client";
import { AuthLayout } from "../components/layout/AuthLayout";
import { Card } from "../components/ui/Card";
import { Button } from "../components/Button";

export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      return;
    }
    apiClient
      .post("/auth/verify-email", { token })
      .then(() => {
        setStatus("success");
        toast.success("Email verified!");
      })
      .catch(() => setStatus("error"));
  }, [searchParams]);

  return (
    <AuthLayout>
      <Card className="text-center">
        {status === "loading" && <p>Verifying your email...</p>}
        {status === "success" && (
          <>
            <p className="mb-4 text-lg font-medium">Email verified successfully!</p>
            <Button label="Go to sign in" onClick={() => navigate("/signin")} />
          </>
        )}
        {status === "error" && (
          <>
            <p className="mb-4 text-destructive">Invalid or expired verification link.</p>
            <Button label="Go to sign in" onClick={() => navigate("/signin")} />
          </>
        )}
      </Card>
    </AuthLayout>
  );
}
