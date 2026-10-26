import Link from "next/link";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  /** When set, the whole tile links to this page. */
  href?: string;
}

const BASE =
  "flex w-[calc(50%-0.5rem)] flex-col sm:w-[180px] items-center gap-1.5 rounded-md border border-border bg-surface p-4";

/** Small icon + label + value tile, used for dashboard/stats summaries. */
export default function StatCard({ icon: Icon, label, value, href }: StatCardProps) {
  const content = (
    <>
      <div className="flex size-10 items-center justify-center rounded-md bg-accent/15">
        <Icon className="size-5 text-accent" />
      </div>
      <p className="text-center font-body text-xs font-medium text-text-secondary">{label}</p>
      <p className="max-w-full min-w-0 text-center font-heading text-[clamp(16px,1.9vw,26px)] font-semibold whitespace-nowrap text-text-primary">
        {value}
      </p>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={`${BASE} transition-colors hover:border-accent`}>
        {content}
      </Link>
    );
  }
  return <div className={BASE}>{content}</div>;
}
