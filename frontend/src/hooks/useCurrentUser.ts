import { useEffect, useState } from "react";
import { apiClient } from "../api/client";
import { UserProfileResponse } from "../types/api";

export function useCurrentUser() {
  const [user, setUser] = useState<UserProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get<UserProfileResponse>("/user/me")
      .then((response) => setUser(response.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  return {
    user,
    firstName: user?.firstName ?? null,
    lastName: user?.lastName ?? null,
    role: user?.role ?? "user",
    emailVerified: user?.emailVerified ?? false,
    username: user?.username ?? null,
    loading,
  };
}
