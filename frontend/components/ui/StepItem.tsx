import type { LucideIcon } from "lucide-react";

interface StepItemProps {
  number: number;
  icon: LucideIcon;
  title: string;
  description: string;
}

export default function StepItem({ number, icon: Icon, title, description }: StepItemProps) {
  return (
    <div className="relative z-10 flex w-40 flex-col items-center gap-2 text-center">
      <div className="relative flex size-10 items-center justify-center rounded-full border border-primary/20 bg-background">
        <Icon className="size-5 text-primary" aria-hidden />
      </div>
      <p className="font-body text-sm font-semibold text-text-primary">
        {number}. {title}
      </p>
      <p className="font-body text-xs text-text-secondary">{description}</p>
    </div>
  );
}
