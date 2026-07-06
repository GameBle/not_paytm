import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { apiClient } from "../api/client";
import { BalanceResponse } from "../types/api";
import { Appbar } from "../components/Appbar";
import { Balance } from "../components/Balance";
import { Users } from "../components/Users";

export function Dashboard() {
  const [balance, setBalance] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [searchParams] = useSearchParams();
  const firstName = searchParams.get("name");

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await apiClient.get<BalanceResponse>("/account/balance");
        setBalance(response.data.balance);
      } catch {
        setError("Failed to load balance.");
      }
    };
    fetchBalance();
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
