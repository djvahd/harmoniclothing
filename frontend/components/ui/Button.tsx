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
        "inline-flex items-center justify-center gap-2 rounded-sm px-5 py-3 font-body text-sm font-medium transition-all duration-150 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:active:scale-100",
        variant === "primary" &&
          "bg-accent text-text-on-accent shadow-sm hover:bg-primary hover:shadow-md",
        variant === "secondary" &&
          "border border-primary text-primary hover:bg-primary hover:text-text-on-accent hover:shadow-md",
        variant === "danger" && "bg-danger text-danger-fg shadow-sm hover:bg-danger/90 hover:shadow-md",
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
