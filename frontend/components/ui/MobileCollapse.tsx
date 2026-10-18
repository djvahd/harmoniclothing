"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";

/** Hides its children behind a toggle button below md; always visible from md up. */
export default function MobileCollapse({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center justify-between rounded-sm border border-border bg-surface px-4 py-2.5 font-body text-sm font-medium text-text-primary md:hidden"
      >
        {label}
        <ChevronDown className={clsx("size-4 transition-transform", open && "rotate-180")} />
      </button>
      <div className={clsx(!open && "hidden", "md:block")}>{children}</div>
    </div>
  );
}
