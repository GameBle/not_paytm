import { useState } from "react";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "../api/client";
import { AuthLayout } from "../components/layout/AuthLayout";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/Button";
import { BottomWarning } from "../components/BottomWarning";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.post("/auth/forgot-password", { email });
      setSent(true);
      toast.success("If the email exists, a reset link was sent.");
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Card>
        <h1 className="mb-2 text-center text-2xl font-bold">Forgot password</h1>
        <p className="mb-6 text-center text-sm text-muted-foreground">
          Enter your email and we&apos;ll send a reset link.
        </p>
        {sent ? (
          <p className="text-center text-sm text-muted-foreground">
            Check your inbox for a password reset link.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="h-4 w-4" />}
            />
            <Button type="submit" label="Send reset link" isLoading={loading} />
          </form>
        )}
        <BottomWarning label="Remember your password?" buttonText="Sign in" to="/signin" />
      </Card>
    </AuthLayout>
  );
}
