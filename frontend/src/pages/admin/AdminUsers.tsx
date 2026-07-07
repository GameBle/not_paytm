import { Link } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { apiClient } from "../../api/client";
import { AdminUsersResponse } from "../../types/api";
import { Appbar } from "../../components/Appbar";
import { AppShell } from "../../components/layout/AppShell";
import { Table, TableCell, TableRow } from "../../components/ui/Table";
import { Input } from "../../components/ui/Input";
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

export function AdminUsers() {
  const [data, setData] = useState<AdminUsersResponse | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<AdminUsersResponse>("/admin/users", {
        params: { page, search },
      });
      setData(res.data);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <AppShell header={<Appbar />}>
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-2xl font-bold">Users</h1>
        <AdminNav />
        <Input
          label="Search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by name or email"
        />
        {loading ? (
          <Skeleton className="h-48 w-full" />
        ) : (
          <Table headers={["Name", "Email", "Role", "Verified", "Balance"]}>
            {data?.items.map((u) => (
              <TableRow key={u._id}>
                <TableCell>
                  {u.firstName} {u.lastName}
                </TableCell>
                <TableCell>{u.username}</TableCell>
                <TableCell className="capitalize">{u.role}</TableCell>
                <TableCell>{u.emailVerified ? "Yes" : "No"}</TableCell>
                <TableCell>₹{u.balance}</TableCell>
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
