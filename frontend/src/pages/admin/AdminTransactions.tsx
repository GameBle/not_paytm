import { Link } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { apiClient } from "../../api/client";
import { TransactionsResponse } from "../../types/api";
import { Appbar } from "../../components/Appbar";
import { AppShell } from "../../components/layout/AppShell";
import { Table, TableCell, TableRow } from "../../components/ui/Table";
import { Skeleton } from "../../components/ui/Skeleton";
import { Button } from "../../components/Button";

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
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-2xl font-bold">All transactions</h1>
        <AdminNav />
        {loading ? (
          <Skeleton className="h-48 w-full" />
        ) : (
          <Table headers={["ID", "Amount", "Status", "Date"]}>
            {data?.items.map((tx) => (
              <TableRow key={tx._id}>
                <TableCell className="font-mono text-xs">{tx._id}</TableCell>
                <TableCell>₹{tx.amount}</TableCell>
                <TableCell className="capitalize">{tx.status}</TableCell>
                <TableCell>{new Date(tx.createdAt).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </Table>
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
