import { LogOut, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { logout } from "../api/client";
import { ThemeToggle } from "./ThemeToggle";
import { Avatar } from "./ui/Avatar";
import { IconButton } from "./ui/IconButton";

interface AppbarProps {
  firstName: string | null;
}

export function Appbar({ firstName }: AppbarProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/signin");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6"
      >
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Wallet className="h-5 w-5" aria-hidden="true" />
          </div>
          <span className="text-lg font-semibold tracking-tight">PayTM</span>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <span className="hidden text-sm text-muted-foreground sm:inline">
            Hello, <span className="font-medium text-foreground">{firstName ?? "User"}</span>
          </span>
          <Avatar name={firstName ?? "User"} size="sm" />
          <ThemeToggle />
          <IconButton aria-label="Log out" onClick={handleLogout} variant="ghost" size="sm">
            <LogOut className="h-4 w-4" />
          </IconButton>
        </div>
      </nav>
    </header>
  );
}
