import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  History,
  LayoutDashboard,
  LogOut,
  Shield,
  User,
  Wallet,
} from "lucide-react";
import { logout } from "../api/client";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { NotificationBell } from "./NotificationBell";
import { ThemeToggle } from "./ThemeToggle";
import { Avatar } from "./ui/Avatar";
import { Skeleton } from "./ui/Skeleton";

interface AppbarProps {
  firstName?: string | null;
}

export function Appbar({ firstName: firstNameProp }: AppbarProps) {
  const navigate = useNavigate();
  const { firstName: fetchedFirstName, role, loading } = useCurrentUser();
  const firstName = firstNameProp ?? fetchedFirstName;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/signin");
  };

  const navLinks = [
    { to: "/dashboard", label: "Dashboard", icon: Wallet },
    { to: "/transactions", label: "Transactions", icon: History },
    ...(role === "admin"
      ? [{ to: "/admin", label: "Admin", icon: Shield }]
      : []),
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6"
      >
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Wallet className="h-5 w-5" aria-hidden="true" />
            </div>
            <span className="text-lg font-semibold tracking-tight">PayTM</span>
          </Link>
          <div className="hidden gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <NotificationBell />
          <ThemeToggle />
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-muted"
            >
              {loading && !firstName ? (
                <Skeleton className="h-9 w-9 rounded-full" />
              ) : (
                <Avatar name={firstName ?? "User"} size="sm" />
              )}
              <ChevronDown className="hidden h-4 w-4 sm:block" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border border-border bg-card py-1 shadow-lg">
                <div className="border-b border-border px-4 py-2">
                  <p className="text-sm font-medium">{firstName ?? "User"}</p>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted"
                >
                  <User className="h-4 w-4" /> Profile
                </Link>
                <Link
                  to="/transactions"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted md:hidden"
                >
                  <History className="h-4 w-4" /> Transactions
                </Link>
                {role === "admin" && (
                  <Link
                    to="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted md:hidden"
                  >
                    <LayoutDashboard className="h-4 w-4" /> Admin
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-muted"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
