import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiClient } from "../../api/client";
import { AdminStats } from "../../types/api";
import { Appbar } from "../../components/Appbar";
import { AppShell } from "../../components/layout/AppShell";
import { Card } from "../../components/ui/Card";
import { Skeleton } from "../../components/ui/Skeleton";

function AdminNav() {
  const links = [
    { to: "/admin", label: "Dashboard" },
    { to: "/admin/users", label: "Users" },
    { to: "/admin/transactions", label: "Transactions" },
  ];
  return (
    <nav className="flex gap-2 border-b border-border pb-4">
      {links.map((l) => (
        <Link
          key={l.to}
          to={l.to}
          className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}

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
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-2xl font-bold">Admin dashboard</h1>
        <AdminNav />
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((c) => (
              <Card key={c.label}>
                <p className="text-sm text-muted-foreground">{c.label}</p>
                <p className="text-2xl font-bold">{c.value}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
