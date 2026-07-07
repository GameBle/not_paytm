interface TableProps {
  headers: string[];
  children: React.ReactNode;
  className?: string;
}

export function Table({ headers, children, className = "" }: TableProps) {
  return (
    <div
      className={`overflow-x-auto rounded-lg border border-border ${className}`}
      role="region"
      aria-label="Data table"
      tabIndex={0}
    >
      <table className="w-full min-w-[32rem] text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            {headers.map((h) => (
              <th
                key={h}
                className="whitespace-nowrap px-3 py-2.5 text-left text-xs font-medium text-muted-foreground sm:px-4 sm:py-3 sm:text-sm"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

interface TableRowProps {
  children: React.ReactNode;
}

export function TableRow({ children }: TableRowProps) {
  return <tr className="border-b border-border last:border-0 hover:bg-muted/30">{children}</tr>;
}

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
}

export function TableCell({ children, className = "" }: TableCellProps) {
  return (
    <td className={`whitespace-nowrap px-3 py-2.5 text-xs sm:px-4 sm:py-3 sm:text-sm ${className}`}>
      {children}
    </td>
  );
}
