import clsx from "clsx";
import { formatCurrency } from "@/lib/format";

interface PriceSummaryRowProps {
  label: string;
  amount: number;
  emphasis?: boolean;
}

export default function PriceSummaryRow({ label, amount, emphasis }: PriceSummaryRowProps) {
  return (
    <div className="flex items-center justify-between font-body text-sm">
      <p className={clsx(emphasis ? "font-semibold text-text-primary" : "text-text-secondary")}>
        {label}
      </p>
      <p className={clsx("font-semibold", emphasis ? "text-lg text-primary" : "text-text-primary")}>
        {formatCurrency(amount)}
      </p>
    </div>
  );
}
