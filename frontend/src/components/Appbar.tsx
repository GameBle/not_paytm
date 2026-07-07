import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  History,
  LogOut,
  Menu,
  Shield,
  User,
  Wallet,
  X,
} from "lucide-react";
import { logout } from "../api/client";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { NotificationBell } from "./NotificationBell";
import { ThemeToggle } from "./ThemeToggle";
import { Avatar } from "./ui/Avatar";
import { IconButton } from "./ui/IconButton";
import { Skeleton } from "./ui/Skeleton";

interface AppbarProps {
  firstName?: string | null;
}

const navLinks = [
  { to: "/dashboard", label: "Dashboard", icon: Wallet },
  { to: "/transactions", label: "Transactions", icon: History },
  { to: "/admin", label: "Admin", icon: Shield, adminOnly: true },
];

export function Appbar({ firstName: firstNameProp }: AppbarProps) {
  const navigate = useNavigate();
  const { firstName: fetchedFirstName, role, loading } = useCurrentUser();
  const firstName = firstNameProp ?? fetchedFirstName;
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const visibleLinks = navLinks.filter((link) => !link.adminOnly || role === "admin");

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileNavOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileNavOpen]);

  const handleLogout = async () => {
    setMobileNavOpen(false);
    await logout();
    navigate("/signin");
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
        <nav
          aria-label="Main navigation"
          className="mx-auto flex h-14 min-h-[3.5rem] max-w-5xl items-center justify-between gap-2 px-3 sm:h-16 sm:px-6"
        >
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            <IconButton
              aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileNavOpen((v) => !v)}
              variant="ghost"
              size="sm"
              className="md:hidden"
            >
              {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </IconButton>
            <Link to="/dashboard" className="flex min-w-0 items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground sm:h-9 sm:w-9">
                <Wallet className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
              </div>
              <span className="truncate text-base font-semibold tracking-tight sm:text-lg">
                PayTM
              </span>
            </Link>
            <div className="hidden gap-1 md:flex">
              {visibleLinks.map((link) => (
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

          <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
            <NotificationBell />
            <ThemeToggle />
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-1 rounded-md px-1.5 py-1 hover:bg-muted sm:gap-2 sm:px-2"
              >
                {loading && !firstName ? (
                  <Skeleton className="h-8 w-8 rounded-full sm:h-9 sm:w-9" />
                ) : (
                  <Avatar name={firstName ?? "User"} size="sm" />
                )}
                <ChevronDown className="hidden h-4 w-4 sm:block" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border border-border bg-card py-1 shadow-lg">
                  <div className="border-b border-border px-4 py-2">
                    <p className="truncate text-sm font-medium">{firstName ?? "User"}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted"
                  >
                    <User className="h-4 w-4" /> Profile
                  </Link>
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

      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            aria-label="Close menu overlay"
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setMobileNavOpen(false)}
          />
          <div className="absolute left-0 top-14 w-full max-w-xs border-b border-r border-border bg-card p-4 shadow-lg sm:top-16">
            <p className="mb-3 px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Menu
            </p>
            <ul className="space-y-1">
              {visibleLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      onClick={() => setMobileNavOpen(false)}
                      className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium hover:bg-muted"
                    >
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      {link.label}
                    </Link>
                  </li>
                );
              })}
              <li>
                <Link
                  to="/profile"
                  onClick={() => setMobileNavOpen(false)}
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium hover:bg-muted"
                >
                  <User className="h-4 w-4 text-muted-foreground" />
                  Profile
                </Link>
              </li>
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
