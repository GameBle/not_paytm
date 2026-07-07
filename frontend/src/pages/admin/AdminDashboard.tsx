import { useEffect, useState } from "react";
import { apiClient } from "../../api/client";
import { AdminStats } from "../../types/api";
import { AdminNav } from "../../components/admin/AdminNav";
import { Appbar } from "../../components/Appbar";
import { AppShell } from "../../components/layout/AppShell";
import { Card } from "../../components/ui/Card";
import { Skeleton } from "../../components/ui/Skeleton";

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get<AdminStats>("/admin/stats")
      .then((res) => setStats(res.data))
      .finally(() => setLoading(false));
  }, []);

  const cards = stats
    ? [
        { label: "Total users", value: stats.totalUsers },
        { label: "Verified users", value: stats.verifiedUsers },
        { label: "Total volume", value: `₹${stats.totalVolume}` },
        { label: "Transactions", value: stats.totalTransactions },
      ]
    : [];

  return (
    <AppShell header={<Appbar />}>
      <div className="space-y-4 animate-fade-in sm:space-y-6">
        <h1 className="text-xl font-bold sm:text-2xl">Admin dashboard</h1>
        <AdminNav />
        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 sm:h-24" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {cards.map((c) => (
              <Card key={c.label} className="p-4 sm:p-6">
                <p className="text-xs text-muted-foreground sm:text-sm">{c.label}</p>
                <p className="text-lg font-bold sm:text-2xl">{c.value}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
