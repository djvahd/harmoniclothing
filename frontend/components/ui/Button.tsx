import { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import clsx from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  fullWidth?: boolean;
  loading?: boolean;
}

export default function Button({
  variant = "primary",
  fullWidth,
  loading,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-sm px-5 py-3 font-body text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" && "bg-accent text-text-on-accent hover:brightness-95",
        variant === "secondary" &&
          "border border-primary text-primary hover:bg-primary/5",
        variant === "danger" && "bg-red-600 text-white hover:bg-red-700",
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  );
}
