"use client";

import { Minus, Plus } from "lucide-react";
import { useTranslations } from "next-intl";

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

/** Numeric +/- stepper with a typeable value, clamped to [min, max]. */
export default function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 999,
}: QuantityStepperProps) {
  const t = useTranslations("ui.quantityStepper");
  return (
    <div className="flex items-center rounded-sm border border-border bg-surface">
      <button
        type="button"
        aria-label={t("decrease")}
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className="flex size-9 items-center justify-center text-text-primary disabled:opacity-40"
      >
        <Minus className="size-4" />
      </button>
      <input
        type="number"
        inputMode="numeric"
        aria-label={t("quantityLabel")}
        min={min}
        max={max}
        value={value}
        onFocus={(e) => e.target.select()}
        onChange={(e) => {
          const n = Math.trunc(Number(e.target.value));
          onChange(Number.isNaN(n) ? min : Math.min(max, Math.max(min, n)));
        }}
        className="h-9 w-12 border-none bg-transparent text-center font-body text-sm font-medium text-text-primary outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        aria-label={t("increase")}
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className="flex size-9 items-center justify-center text-text-primary disabled:opacity-40"
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
