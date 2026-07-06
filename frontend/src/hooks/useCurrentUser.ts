import { useEffect, useState } from "react";
import { apiClient } from "../api/client";
import { UserProfileResponse } from "../types/api";

export function useCurrentUser() {
  const [firstName, setFirstName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get<UserProfileResponse>("/user/me")
      .then((response) => setFirstName(response.data.firstName))
      .catch(() => setFirstName(null))
      .finally(() => setLoading(false));
  }, []);

  return { firstName, loading };
}
