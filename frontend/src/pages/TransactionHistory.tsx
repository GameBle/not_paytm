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
      <div className="space-y-4 animate-fade-in sm:space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl font-bold sm:text-2xl">Transaction history</h1>
          <div className="flex flex-wrap gap-2">
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
                className="flex w-full flex-col gap-2 rounded-lg border border-border bg-card p-3 text-left hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between sm:p-4"
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
                  className={`shrink-0 self-end text-base font-semibold sm:self-auto sm:text-lg ${
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
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
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
