"use client";

import { useEffect, useRef, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { useTranslations } from "next-intl";

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

/**
 * Numeric +/- stepper with a typeable value, clamped to [min, max]. Typed digits stay local and are
 * committed on blur, Enter or after a short pause, so a slow onChange (e.g. an API call) never
 * overwrites what is being typed. The +/- buttons commit immediately.
 */
export default function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 999,
}: QuantityStepperProps) {
  const t = useTranslations("ui.quantityStepper");
  const [draft, setDraft] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  function commit(raw: string) {
    if (timer.current) clearTimeout(timer.current);
    setDraft(null);
    const n = Math.trunc(Number(raw));
    const next = raw === "" || Number.isNaN(n) ? min : Math.min(max, Math.max(min, n));
    if (next !== value) onChange(next);
  }

  function step(next: number) {
    if (timer.current) clearTimeout(timer.current);
    setDraft(null);
    onChange(next);
  }

  return (
    <div className="flex items-center rounded-sm border border-border bg-surface">
      <button
        type="button"
        aria-label={t("decrease")}
        disabled={value <= min}
        onClick={() => step(Math.max(min, value - 1))}
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
        value={draft ?? value}
        onFocus={(e) => e.target.select()}
        onChange={(e) => {
          const raw = e.target.value;
          setDraft(raw);
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => commit(raw), 500);
        }}
        onBlur={(e) => {
          if (draft !== null) commit(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit(e.currentTarget.value);
        }}
        className="h-9 w-12 border-none bg-transparent text-center font-body text-sm font-medium text-text-primary outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        aria-label={t("increase")}
        disabled={value >= max}
        onClick={() => step(Math.min(max, value + 1))}
        className="flex size-9 items-center justify-center text-text-primary disabled:opacity-40"
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
