import { ReactNode } from "react";
import { cn } from "../../lib/cn";

interface AppShellProps {
  children: ReactNode;
  header?: ReactNode;
  className?: string;
}

export function AppShell({ children, header, className }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      {header}
      <main className={cn("mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8", className)}>
        {children}
      </main>
    </div>
  );
}
