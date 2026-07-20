import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
}

export default function StatCard({ icon: Icon, label, value }: StatCardProps) {
  return (
    <div className="flex w-[180px] flex-col items-center gap-1.5 rounded-md border border-border bg-surface p-4">
      <div className="flex size-10 items-center justify-center rounded-md bg-accent/15">
        <Icon className="size-5 text-accent" />
      </div>
      <p className="text-center font-body text-xs font-medium text-text-secondary">{label}</p>
      <p className="text-center font-heading text-[26px] font-semibold text-text-primary">
        {value}
      </p>
    </div>
  );
}
