interface TableProps {
  headers: string[];
  children: React.ReactNode;
}

export function Table({ headers, children }: TableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            {headers.map((h) => (
              <th key={h} className="px-4 py-3 text-left font-medium text-muted-foreground">
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
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}
