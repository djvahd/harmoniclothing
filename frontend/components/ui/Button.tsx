import { ButtonHTMLAttributes } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import clsx from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  fullWidth?: boolean;
  loading?: boolean;
  /** Renders a single link styled as a button (never a <button> nested in an <a>, which is invalid HTML). */
  href?: string;
}

/** Standard button; `loading` shows a spinner and disables the button, forwards all native button props. */
export default function Button({
  variant = "primary",
  fullWidth,
  loading,
  disabled,
  className,
  children,
  href,
  ...props
}: ButtonProps) {
  const classes = clsx(
    "inline-flex items-center justify-center gap-2 rounded-sm px-5 py-3 font-body text-sm font-medium transition-all duration-150 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:active:scale-100",
    // Dark text on the green accent (7:1); white on it was only 2.4:1. Hover turns teal, where white is 5.4:1.
    variant === "primary" &&
      "bg-accent text-text-primary shadow-sm hover:bg-primary hover:text-text-on-accent hover:shadow-md",
    variant === "secondary" &&
      "border border-primary text-primary hover:bg-primary hover:text-text-on-accent hover:shadow-md",
    variant === "danger" && "bg-danger text-danger-fg shadow-sm hover:bg-danger/90 hover:shadow-md",
    fullWidth && "w-full",
    className,
  );

  if (href !== undefined && !disabled && !loading) {
    return (
      <Link
        href={href}
        className={classes}
        onClick={props.onClick as unknown as React.MouseEventHandler<HTMLAnchorElement> | undefined}
      >
        {children}
      </Link>
    );
  }

  return (
    <button disabled={disabled || loading} className={classes} {...props}>
      {loading && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  );
}
