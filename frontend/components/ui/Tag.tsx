import clsx from "clsx";

export default function Tag({
  children,
  active,
  size = "xs",
}: {
  children: React.ReactNode;
  active?: boolean;
  size?: "xs" | "sm";
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-[10px] py-1 font-body font-medium transition-colors",
        size === "sm" ? "text-sm" : "text-xs",
        active
          ? "border-primary bg-primary text-text-on-accent"
          : "border-border text-text-secondary",
      )}
    >
      {children}
    </span>
  );
}
