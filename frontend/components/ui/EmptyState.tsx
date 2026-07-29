import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex w-full flex-col items-center gap-2 py-16 text-center">
      <Icon className="size-10 text-text-secondary" />
      <p className="font-body text-sm font-medium text-text-primary">{title}</p>
      {description && <p className="font-body text-sm text-text-secondary">{description}</p>}
      {action}
    </div>
  );
}
