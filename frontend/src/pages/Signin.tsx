import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../api/client";
import { AuthResponse } from "../types/api";
import { BottomWarning } from "../components/BottomWarning";
import { Button } from "../components/Button";
import { Heading } from "../components/Heading";
import { InputBox } from "../components/InputBox";
import { SubHeading } from "../components/SubHeading";

export function Signin() {
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignin = async () => {
    setError("");
    setLoading(true);
    try {
      const response = await apiClient.post<AuthResponse>("/user/signin", {
        username,
        password,
      });
      localStorage.setItem("token", response.data.token);
      navigate(`/dashboard?name=${encodeURIComponent(response.data.firstName)}`);
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-300 h-screen flex justify-center">
      <div className="flex flex-col justify-center">
        <div className="rounded-lg bg-white w-80 text-center p-2 h-max px-4">
          <Heading label="Sign in" />
          <SubHeading label="Enter your credentials to access your account" />
          <InputBox
            onChange={(e) => setUsername(e.target.value)}
            placeholder="your-email-account@gmail.com"
            label="Email"
          />
          <InputBox
            onChange={(e) => setPassword(e.target.value)}
            placeholder="123456"
            label="Password"
            type="password"
          />
          {error && <p className="text-red-600 text-sm py-2">{error}</p>}
          <div className="pt-4">
            <Button onClick={handleSignin} label={loading ? "Signing in..." : "Sign in"} disabled={loading} />
          </div>
          <BottomWarning label="Don't have an account?" buttonText="Sign up" to="/signup" />
        </div>
      </div>
    </div>
  );
}
