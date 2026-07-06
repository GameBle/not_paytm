import { ReactNode } from "react";
import { cn } from "../../lib/cn";

interface AuthLayoutProps {
  children: ReactNode;
  className?: string;
}

export function AuthLayout({ children, className }: AuthLayoutProps) {
  return (
    <div
      className={cn(
        "min-h-screen bg-background",
        "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/40 via-background to-background",
        "dark:from-accent/10",
        "flex items-center justify-center p-4 sm:p-6",
        className
      )}
    >
      <div className="w-full max-w-sm animate-fade-in">{children}</div>
    </div>
  );
}
