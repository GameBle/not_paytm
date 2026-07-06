import { useCallback, useEffect, useState } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { apiClient } from "../api/client";
import { BalanceResponse } from "../types/api";
import { Appbar } from "../components/Appbar";
import { Balance } from "../components/Balance";
import { Users } from "../components/Users";
import { AppShell } from "../components/layout/AppShell";
import { Button } from "../components/Button";
import { Card } from "../components/ui/Card";
import { Skeleton } from "../components/ui/Skeleton";

export function Dashboard() {
  const [balance, setBalance] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const balanceResponse = await apiClient.get<BalanceResponse>("/account/balance");
      setBalance(balanceResponse.data.balance);
    } catch {
      setError("Failed to load dashboard. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <AppShell header={<Appbar />}>
      <div className="space-y-8 animate-fade-in">
        {error ? (
          <Card className="flex flex-col items-center gap-4 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-6 w-6 text-destructive" aria-hidden="true" />
            </div>
            <div>
              <p className="font-medium text-foreground">{error}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Check your connection and try again.
              </p>
            </div>
            <Button
              variant="secondary"
              fullWidth={false}
              leftIcon={<RefreshCw className="h-4 w-4" />}
              label="Retry"
              onClick={fetchDashboardData}
            />
          </Card>
        ) : (
          <>
            <Card padding="lg" className="bg-gradient-to-br from-card to-accent/30">
              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-48" />
                </div>
              ) : (
                <Balance value={balance ?? 0} />
              )}
            </Card>
            {!loading && <Users />}
            {loading && (
              <div className="space-y-4">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-11 w-full rounded-md" />
                <Skeleton className="h-48 w-full rounded-lg" />
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
