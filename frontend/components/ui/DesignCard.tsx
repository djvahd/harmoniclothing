import Link from "next/link";
import Image from "next/image";
import { storageUrl } from "@/lib/storage";
import { formatCurrency } from "@/lib/format";
import type { Design } from "@/types/product";

interface DesignCardProps {
  design: Design;
  startingPrice?: number;
}

export default function DesignCard({ design, startingPrice }: DesignCardProps) {
  const thumbnail = storageUrl(design.thumbnail_path);

  return (
    <Link
      href={`/marketplace-desain/${design.slug}`}
      className="flex w-[220px] flex-col gap-2 rounded-md border border-border bg-surface p-3"
    >
      <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-sm bg-border">
        {thumbnail && (
          <Image src={thumbnail} alt={design.title} fill sizes="220px" className="object-cover" />
        )}
      </div>
      <p className="font-body text-sm font-semibold text-text-primary">{design.title}</p>
      <div className="flex items-center gap-1.5">
        <span className="size-4 shrink-0 rounded-full bg-border" />
        <p className="font-body text-xs text-text-secondary">by {design.creator.name}</p>
      </div>
      {startingPrice !== undefined && (
        <p className="font-body text-[13px] font-semibold text-text-primary">
          Mulai dari {formatCurrency(startingPrice)}
        </p>
      )}
    </Link>
  );
}
