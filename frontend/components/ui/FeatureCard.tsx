import type { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export default function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <div className="flex w-[220px] flex-col gap-2.5 rounded-md border border-border bg-surface p-4">
      <div className="flex size-10 items-center justify-center rounded-md bg-accent">
        <Icon className="size-5 text-text-on-accent" />
      </div>
      <p className="font-body text-body font-semibold text-text-primary">{title}</p>
      <p className="font-body text-body-sm text-text-secondary">{description}</p>
    </div>
  );
}
