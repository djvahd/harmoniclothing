import type { LucideIcon } from "lucide-react";

interface StepItemProps {
  number: number;
  icon: LucideIcon;
  title: string;
  description: string;
}

export default function StepItem({ number, icon: Icon, title, description }: StepItemProps) {
  return (
    <div className="flex w-40 flex-col items-center gap-2 text-center">
      <div className="relative flex size-10 items-center justify-center rounded-full bg-primary/10">
        <Icon className="size-5 text-primary" aria-hidden />
        <span className="sr-only">Langkah {number}</span>
      </div>
      <p className="font-body text-sm font-semibold text-text-primary">{title}</p>
      <p className="font-body text-xs text-text-secondary">{description}</p>
    </div>
  );
}
