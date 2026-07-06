import { useEffect, useState } from "react";
import { apiClient } from "../api/client";
import { BalanceResponse, UserProfileResponse } from "../types/api";
import { Appbar } from "../components/Appbar";
import { Balance } from "../components/Balance";
import { Users } from "../components/Users";

export function Dashboard() {
  const [balance, setBalance] = useState<number | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [profileResponse, balanceResponse] = await Promise.all([
          apiClient.get<UserProfileResponse>("/user/me"),
          apiClient.get<BalanceResponse>("/account/balance"),
        ]);
        setFirstName(profileResponse.data.firstName);
        setBalance(balanceResponse.data.balance);
      } catch {
        setError("Failed to load dashboard.");
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div>
      <Appbar firstName={firstName} />
      <div className="m-8">
        {error && <p className="text-red-600">{error}</p>}
        {balance !== null ? (
          <>
            <Balance value={balance} />
            <Users />
          </>
        ) : (
          !error && <p>Loading balance...</p>
        )}
      </div>
    </div>
  );
}
