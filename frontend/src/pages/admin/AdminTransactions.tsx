import { useCallback, useEffect, useState } from "react";
import { apiClient } from "../../api/client";
import { TransactionsResponse } from "../../types/api";
import { AdminNav } from "../../components/admin/AdminNav";
import { Appbar } from "../../components/Appbar";
import { AppShell } from "../../components/layout/AppShell";
import { Table, TableCell, TableRow } from "../../components/ui/Table";
import { Skeleton } from "../../components/ui/Skeleton";
import { Button } from "../../components/Button";

export function AdminTransactions() {
  const [data, setData] = useState<TransactionsResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<TransactionsResponse>("/admin/transactions", {
        params: { page },
      });
      setData(res.data);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return (
    <AppShell header={<Appbar />}>
      <div className="space-y-4 animate-fade-in sm:space-y-6">
        <h1 className="text-xl font-bold sm:text-2xl">All transactions</h1>
        <AdminNav />
        {loading ? (
          <Skeleton className="h-48 w-full" />
        ) : (
          <Table headers={["ID", "Amount", "Status", "Date"]}>
            {data?.items.map((tx) => (
              <TableRow key={tx._id}>
                <TableCell className="max-w-[6rem] truncate font-mono text-xs sm:max-w-none">
                  {tx._id}
                </TableCell>
                <TableCell>₹{tx.amount}</TableCell>
                <TableCell className="capitalize">{tx.status}</TableCell>
                <TableCell className="whitespace-normal sm:whitespace-nowrap">
                  {new Date(tx.createdAt).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </Table>
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
