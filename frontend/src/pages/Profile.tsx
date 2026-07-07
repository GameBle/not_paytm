import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Lock, Shield, User } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "../api/client";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { Appbar } from "../components/Appbar";
import { AppShell } from "../components/layout/AppShell";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/Button";
import { Skeleton } from "../components/ui/Skeleton";

export function Profile() {
  const { user, loading, emailVerified, username, role } = useCurrentUser();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (user && !initialized) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setInitialized(true);
    }
  }, [user, initialized]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.put("/user/", { firstName, lastName });
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.put("/user/", { password: newPassword, currentPassword });
      toast.success("Password changed");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to change password";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleResendVerification = async () => {
    if (!username) return;
    try {
      await apiClient.post("/auth/resend-verification", { email: username });
      toast.success("Verification email sent");
    } catch {
      toast.error("Failed to send verification email");
    }
  };

  return (
    <AppShell header={<Appbar />}>
      <div className="mx-auto max-w-lg space-y-4 animate-fade-in sm:space-y-6">
        <h1 className="text-xl font-bold sm:text-2xl">Profile</h1>
        {loading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <>
            {!emailVerified && (
              <Card className="border-amber-500/50 bg-amber-500/10">
                <p className="text-sm">
                  Your email is not verified.{" "}
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    className="font-medium text-primary hover:underline"
                  >
                    Resend verification email
                  </button>
                </p>
              </Card>
            )}
            <Card>
              <h2 className="mb-4 font-semibold">Account</h2>
              <p className="text-sm text-muted-foreground">
                Role:{" "}
                <span className="font-medium capitalize text-foreground">{role}</span>
              </p>
              {role === "admin" && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    to="/admin"
                    className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground"
                  >
                    <Shield className="h-4 w-4" /> Admin dashboard
                  </Link>
                  <Link
                    to="/admin/users"
                    className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-muted"
                  >
                    Manage users
                  </Link>
                  <Link
                    to="/admin/transactions"
                    className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-muted"
                  >
                    All transactions
                  </Link>
                </div>
              )}
            </Card>
            <Card>
              <h2 className="mb-4 font-semibold">Personal info</h2>
              <p className="mb-4 text-sm text-muted-foreground">{username}</p>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <Input
                  label="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  leftIcon={<User className="h-4 w-4" />}
                />
                <Input
                  label="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  leftIcon={<User className="h-4 w-4" />}
                />
                <Button type="submit" label="Save changes" isLoading={saving} />
              </form>
            </Card>
            <Card>
              <h2 className="mb-4 font-semibold">Change password</h2>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <Input
                  label="Current password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  leftIcon={<Lock className="h-4 w-4" />}
                />
                <Input
                  label="New password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  leftIcon={<Lock className="h-4 w-4" />}
                />
                <Button type="submit" label="Change password" isLoading={saving} />
              </form>
            </Card>
          </>
        )}
      </div>
    </AppShell>
  );
}
