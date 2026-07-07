import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../api/client";
import { TransactionsResponse } from "../types/api";
import { Appbar } from "../components/Appbar";
import { AppShell } from "../components/layout/AppShell";
import { Card } from "../components/ui/Card";
import { Skeleton } from "../components/ui/Skeleton";
import { Button } from "../components/Button";

export function TransactionHistory() {
  const navigate = useNavigate();
  const [data, setData] = useState<TransactionsResponse | null>(null);
  const [filter, setFilter] = useState<"all" | "sent" | "received">("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<TransactionsResponse>("/transactions", {
        params: { page, type: filter },
      });
      setData(res.data);
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return (
    <AppShell header={<Appbar />}>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Transaction history</h1>
          <div className="flex gap-2">
            {(["all", "sent", "received"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setFilter(t);
                  setPage(1);
                }}
                className={`rounded-md px-3 py-1 text-sm capitalize ${
                  filter === t ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <Skeleton className="h-48 w-full" />
        ) : data?.items.length === 0 ? (
          <Card className="py-12 text-center text-muted-foreground">No transactions yet.</Card>
        ) : (
          <div className="space-y-2">
            {data?.items.map((tx) => (
              <button
                key={tx._id}
                type="button"
                onClick={() => navigate(`/transactions/${tx._id}`)}
                className="flex w-full items-center justify-between rounded-lg border border-border bg-card p-4 text-left hover:bg-muted/30"
              >
                <div>
                  <p className="font-medium">
                    {tx.direction === "sent" ? "Sent to" : "Received from"}{" "}
                    {tx.counterpart?.firstName ?? "Unknown"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(tx.createdAt).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`font-semibold ${
                    tx.direction === "sent" ? "text-destructive" : "text-green-600"
                  }`}
                >
                  {tx.direction === "sent" ? "-" : "+"}₹{tx.amount}
                </span>
              </button>
            ))}
          </div>
        )}

        {data && data.total > data.limit && (
          <div className="flex justify-center gap-2">
            <Button
              label="Previous"
              variant="secondary"
              fullWidth={false}
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            />
            <Button
              label="Next"
              variant="secondary"
              fullWidth={false}
              disabled={page * data.limit >= data.total}
              onClick={() => setPage((p) => p + 1)}
            />
          </div>
        )}
      </div>
    </AppShell>
  );
}
