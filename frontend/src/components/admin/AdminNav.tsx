import { Link, useLocation } from "react-router-dom";
import { cn } from "../../lib/cn";

const links = [
  { to: "/admin", label: "Dashboard" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/transactions", label: "Transactions" },
];

export function AdminNav() {
  const location = useLocation();

  return (
    <nav
      aria-label="Admin navigation"
      className="-mx-1 flex gap-1 overflow-x-auto border-b border-border pb-4 scrollbar-thin"
    >
      {links.map((l) => {
        const active = location.pathname === l.to;
        return (
          <Link
            key={l.to}
            to={l.to}
            className={cn(
              "shrink-0 rounded-md px-3 py-2 text-sm transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
