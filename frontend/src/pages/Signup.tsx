import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { toast } from "sonner";
import { apiClient, setAccessToken } from "../api/client";
import { AuthResponse } from "../types/api";
import { BottomWarning } from "../components/BottomWarning";
import { Button } from "../components/Button";
import { AuthLayout } from "../components/layout/AuthLayout";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { IconButton } from "../components/ui/IconButton";

export function Signup() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await apiClient.post<AuthResponse>("/user/signup", {
        username,
        firstName,
        lastName,
        password,
      });
      setAccessToken(response.data.token, false);
      toast.success("Account created successfully!");
      navigate("/dashboard");
    } catch {
      setError("Signup failed. Check your inputs or try a different email.");
      toast.error("Could not create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Card>
        <div className="mb-6 space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Create account</h1>
          <p className="text-sm text-muted-foreground">
            Enter your information to get started
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="First name"
              placeholder="John"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              leftIcon={<User className="h-4 w-4" aria-hidden="true" />}
            />
            <Input
              label="Last name"
              placeholder="Doe"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
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
            autoComplete="new-password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="h-4 w-4" aria-hidden="true" />}
            helperText="Minimum 6 characters"
            error={error || undefined}
            rightElement={
              <IconButton
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((value) => !value)}
                size="sm"
                variant="ghost"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </IconButton>
            }
          />
          <Button type="submit" label="Create account" isLoading={loading} />
        </form>

        <BottomWarning label="Already have an account?" buttonText="Sign in" to="/signin" />
      </Card>
    </AuthLayout>
  );
}
