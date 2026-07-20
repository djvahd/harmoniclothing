import { Minus, Plus } from "lucide-react";

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export default function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 999,
}: QuantityStepperProps) {
  return (
    <div className="flex items-center rounded-sm border border-border bg-surface">
      <button
        type="button"
        aria-label="Kurangi jumlah"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className="flex size-9 items-center justify-center text-text-primary disabled:opacity-40"
      >
        <Minus className="size-4" />
      </button>
      <span className="flex h-9 w-10 items-center justify-center font-body text-sm font-medium text-text-primary">
        {value}
      </span>
      <button
        type="button"
        aria-label="Tambah jumlah"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className="flex size-9 items-center justify-center text-text-primary disabled:opacity-40"
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
