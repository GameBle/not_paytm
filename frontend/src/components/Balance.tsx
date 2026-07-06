interface BalanceProps {
  value: number;
  loading?: boolean;
}

export function Balance({ value, loading = false }: BalanceProps) {
  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);

  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-muted-foreground">Available balance</p>
      <p
        className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
        aria-live="polite"
      >
        {loading ? "—" : formatted}
      </p>
    </div>
  );
}
