import clsx from "clsx";

export type BadgeVariant = "success" | "warning" | "danger" | "neutral" | "info";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: "bg-accent text-text-on-accent",
  warning: "bg-amber-500 text-white",
  danger: "bg-red-600 text-white",
  neutral: "bg-border text-text-secondary",
  info: "bg-primary text-text-on-accent",
};

export default function Badge({ variant = "neutral", children, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-[10px] py-[5px] font-body text-xs font-medium",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
