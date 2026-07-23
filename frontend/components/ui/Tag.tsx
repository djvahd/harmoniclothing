import clsx from "clsx";

export default function Tag({
  children,
  active,
}: {
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-[10px] py-1 font-body text-xs font-medium transition-colors",
        active
          ? "border-primary bg-primary text-text-on-accent"
          : "border-border text-text-secondary",
      )}
    >
      {children}
    </span>
  );
}
