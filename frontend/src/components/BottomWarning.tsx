import { Link } from "react-router-dom";

interface BottomWarningProps {
  label: string;
  buttonText: string;
  to: string;
}

export function BottomWarning({ label, buttonText, to }: BottomWarningProps) {
  return (
    <p className="pt-4 text-center text-sm text-muted-foreground">
      {label}{" "}
      <Link
        to={to}
        className="font-medium text-primary underline-offset-4 hover:underline focus-visible:rounded-sm"
      >
        {buttonText}
      </Link>
    </p>
  );
}
