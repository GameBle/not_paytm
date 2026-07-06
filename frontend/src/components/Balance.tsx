interface BalanceProps {
  value: number;
}

export function Balance({ value }: BalanceProps) {
  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);

  return (
    <div className="flex">
      <div className="font-bold text-lg">Your balance</div>
      <div className="font-semibold ml-4 text-lg">{formatted}</div>
    </div>
  );
}
