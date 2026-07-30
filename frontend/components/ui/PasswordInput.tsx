"use client";

import { InputHTMLAttributes, forwardRef, useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import clsx from "clsx";
import { useTranslations } from "next-intl";

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

/** Password field with a show/hide toggle; otherwise mirrors Input's label/error layout. */
const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const t = useTranslations("ui.passwordInput");
    const [visible, setVisible] = useState(false);

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="font-body text-xs font-medium text-text-secondary">
            {label}
          </label>
        )}
        <div
          className={clsx(
            "flex items-center gap-2 rounded-sm border bg-surface px-3 py-2.5 transition-colors",
            error ? "border-danger" : "border-border hover:border-primary focus-within:border-primary",
          )}
        >
          <Lock className="size-4 shrink-0 text-text-secondary" />
          <input
            ref={ref}
            id={id}
            type={visible ? "text" : "password"}
            className={clsx(
              "w-full bg-transparent font-body text-sm text-text-primary outline-none placeholder:text-text-secondary",
              className,
            )}
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? t("hide") : t("show")}
            className="shrink-0 text-text-secondary"
          >
            {visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
          </button>
        </div>
        {error && <p className="font-body text-xs text-danger">{error}</p>}
      </div>
    );
  },
);
PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
