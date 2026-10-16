"use client";

import { InputHTMLAttributes, forwardRef, useId } from "react";
import type { LucideIcon } from "lucide-react";
import clsx from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: LucideIcon;
  error?: string;
}

/** Labeled text input with optional leading icon and inline error message. */
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon: Icon, error, className, id, ...props }, ref) => {
    // Always connect label and input (and the error text) so screen readers can announce them.
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="font-body text-xs font-medium text-text-secondary"
          >
            {label}
          </label>
        )}
        <div
          className={clsx(
            "flex items-center gap-2 rounded-sm border bg-surface px-3 py-2.5 transition-colors",
            error ? "border-danger" : "border-border hover:border-primary focus-within:border-primary",
          )}
        >
          {Icon && <Icon className="size-4 shrink-0 text-text-secondary" />}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className={clsx(
              "w-full bg-transparent font-body text-sm text-text-primary outline-none placeholder:text-text-secondary",
              className,
            )}
            {...props}
          />
        </div>
        {error && (
          <p id={errorId} role="alert" className="font-body text-xs text-danger">
            {error}
          </p>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export default Input;
