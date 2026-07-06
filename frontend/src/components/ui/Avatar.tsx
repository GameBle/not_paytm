import { cn } from "../../lib/cn";

type AvatarSize = "sm" | "md" | "lg";

interface AvatarProps {
  name: string;
  size?: AvatarSize;
  className?: string;
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: "h-9 w-9 text-sm",
  md: "h-11 w-11 text-base",
  lg: "h-14 w-14 text-xl",
};

const colorClasses = [
  "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
  "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
];

function getColorIndex(name: string): number {
  return name.charCodeAt(0) % colorClasses.length;
}

export function Avatar({ name, size = "md", className }: AvatarProps) {
  const initial = name.charAt(0).toUpperCase() || "?";

  return (
    <div
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold",
        sizeClasses[size],
        colorClasses[getColorIndex(name)],
        className
      )}
    >
      {initial}
    </div>
  );
}
