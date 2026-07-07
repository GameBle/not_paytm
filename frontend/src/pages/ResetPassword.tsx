import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "../api/client";
import { AuthLayout } from "../components/layout/AuthLayout";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/Button";

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = searchParams.get("token");
    if (!token) {
      toast.error("Invalid reset link.");
      return;
    }
    setLoading(true);
    try {
      await apiClient.post("/auth/reset-password", { token, password });
      toast.success("Password reset successfully!");
      navigate("/signin");
    } catch {
      toast.error("Invalid or expired reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Card>
        <h1 className="mb-6 text-center text-2xl font-bold">Reset password</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="New password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="h-4 w-4" />}
          />
          <Button type="submit" label="Reset password" isLoading={loading} />
        </form>
      </Card>
    </AuthLayout>
  );
}
