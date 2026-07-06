import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Users as UsersIcon, X } from "lucide-react";
import { apiClient } from "../api/client";
import { UserSummary } from "../types/api";
import { Button } from "./Button";
import { Avatar } from "./ui/Avatar";
import { Input } from "./ui/Input";
import { Skeleton } from "./ui/Skeleton";

const PAGE_SIZE = 5;

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export function Users() {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const debouncedFilter = useDebounce(filter, 300);

  useEffect(() => {
    setLoading(true);
    apiClient
      .get("/user/bulk", { params: { filter: debouncedFilter } })
      .then((response) => {
        setUsers(response.data.user);
        setVisibleCount(PAGE_SIZE);
      })
      .catch((error) => {
        console.error("Failed to load users:", error);
      })
      .finally(() => setLoading(false));
  }, [debouncedFilter]);

  const visibleUsers = users.slice(0, visibleCount);
  const hasMore = visibleCount < users.length;

  return (
    <section aria-labelledby="users-heading" className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 id="users-heading" className="text-lg font-semibold tracking-tight">
          Send to users
        </h2>
        {!loading && (
          <span className="text-sm text-muted-foreground">{users.length} found</span>
        )}
      </div>

      <Input
        label="Search users"
        placeholder="Search by name..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        leftIcon={<Search className="h-4 w-4" aria-hidden="true" />}
        rightElement={
          filter ? (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setFilter("")}
              className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          ) : undefined
        }
      />

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        {loading ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center gap-4 p-4">
                <Skeleton className="h-11 w-11 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-9 w-24 rounded-md" />
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <UsersIcon className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
            </div>
            <div>
              <p className="font-medium text-foreground">No users found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try a different search term or invite someone to join.
              </p>
            </div>
          </div>
        ) : (
          <>
            <ul className="divide-y divide-border" role="list">
              {visibleUsers.map((user) => (
                <UserRow key={user._id} user={user} />
              ))}
            </ul>
            {hasMore && (
              <div className="border-t border-border p-4">
                <Button
                  variant="secondary"
                  size="sm"
                  label={`Show more (${users.length - visibleCount} remaining)`}
                  onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                />
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function UserRow({ user }: { user: UserSummary }) {
  const navigate = useNavigate();

  return (
    <li className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-muted/50">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar name={user.firstName} size="md" />
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">
            {user.firstName} {user.lastName}
          </p>
          <p className="truncate text-sm text-muted-foreground">{user.username}</p>
        </div>
      </div>
      <Button
        variant="primary"
        size="sm"
        fullWidth={false}
        label="Send"
        onClick={() => {
          navigate(`/send?id=${user._id}&name=${encodeURIComponent(user.firstName)}`);
        }}
      />
    </li>
  );
}
