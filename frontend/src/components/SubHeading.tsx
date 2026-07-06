interface SubHeadingProps {
  label: string;
}

export function SubHeading({ label }: SubHeadingProps) {
  return <div className="text-slate-500 text-md pt-1 px-4 pb-4">{label}</div>;
}
