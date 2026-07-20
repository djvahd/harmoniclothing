import { InputHTMLAttributes, forwardRef } from "react";
import type { LucideIcon } from "lucide-react";
import clsx from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: LucideIcon;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon: Icon, error, className, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={id}
            className="font-body text-xs font-medium text-text-secondary"
          >
            {label}
          </label>
        )}
        <div
          className={clsx(
            "flex items-center gap-2 rounded-sm border bg-surface px-3 py-2.5",
            error ? "border-red-500" : "border-border",
          )}
        >
          {Icon && <Icon className="size-4 shrink-0 text-text-secondary" />}
          <input
            ref={ref}
            id={id}
            className={clsx(
              "w-full bg-transparent font-body text-sm text-text-primary outline-none placeholder:text-text-secondary",
              className,
            )}
            {...props}
          />
        </div>
        {error && <p className="font-body text-xs text-red-500">{error}</p>}
      </div>
    );
  },
);
Input.displayName = "Input";

export default Input;
