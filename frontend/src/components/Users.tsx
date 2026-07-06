import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../api/client";
import { UserSummary } from "../types/api";
import { Button } from "./Button";

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
  const debouncedFilter = useDebounce(filter, 300);

  useEffect(() => {
    apiClient
      .get("/user/bulk", { params: { filter: debouncedFilter } })
      .then((response) => {
        setUsers(response.data.user);
      })
      .catch((error) => {
        console.error("Failed to load users:", error);
      });
  }, [debouncedFilter]);

  return (
    <>
      <div className="font-bold mt-6 text-lg">Users</div>
      <div className="my-2">
        <input
          onChange={(e) => setFilter(e.target.value)}
          type="text"
          placeholder="Search users..."
          className="w-full px-2 py-1 border rounded border-slate-200"
        />
      </div>
      <div>
        {users.length === 0 ? (
          <p className="text-slate-500 text-sm">No users found.</p>
        ) : (
          users.map((user) => <UserRow key={user._id} user={user} />)
        )}
      </div>
    </>
  );
}

function UserRow({ user }: { user: UserSummary }) {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between py-2">
      <div className="flex">
        <div className="rounded-full h-12 w-12 bg-slate-200 flex justify-center mt-1 mr-2">
          <div className="flex flex-col justify-center h-full text-xl">
            {user.firstName[0]}
          </div>
        </div>
        <div className="flex flex-col justify-center">
          <div>
            {user.firstName} {user.lastName}
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-center">
        <Button
          onClick={() => {
            navigate(`/send?id=${user._id}&name=${encodeURIComponent(user.firstName)}`);
          }}
          label="Send Money"
        />
      </div>
    </div>
  );
}
