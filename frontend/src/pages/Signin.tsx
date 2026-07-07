import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { apiClient, setAccessToken } from "../api/client";
import { AuthResponse } from "../types/api";
import { BottomWarning } from "../components/BottomWarning";
import { Button } from "../components/Button";
import { AuthLayout } from "../components/layout/AuthLayout";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { IconButton } from "../components/ui/IconButton";

export function Signin() {
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await apiClient.post<AuthResponse>("/user/signin", {
        username,
        password,
        rememberMe,
      });
      setAccessToken(response.data.token);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch {
      setError("Invalid email or password.");
      toast.error("Sign in failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Card>
        <div className="mb-6 space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Sign in</h1>
          <p className="text-sm text-muted-foreground">
            Enter your credentials to access your account
          </p>
        </div>

        <form onSubmit={handleSignin} className="space-y-4">
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            leftIcon={<Mail className="h-4 w-4" aria-hidden="true" />}
          />
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="h-4 w-4" aria-hidden="true" />}
            error={error || undefined}
            rightElement={
              <IconButton
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((value) => !value)}
                size="sm"
                variant="ghost"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </IconButton>
            }
          />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-border"
              />
              Remember me
            </label>
            <Link to="/forgot-password" className="text-sm text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <Button type="submit" label="Sign in" isLoading={loading} />
        </form>

        <BottomWarning label="Don't have an account?" buttonText="Sign up" to="/signup" />
      </Card>
    </AuthLayout>
  );
}
