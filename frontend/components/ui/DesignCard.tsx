import Link from "next/link";
import Image from "next/image";
import { storageUrl } from "@/lib/storage";
import { formatCurrency } from "@/lib/format";
import type { Design } from "@/types/product";
import WishlistButton from "./WishlistButton";

interface DesignCardProps {
  design: Design;
  startingPrice?: number;
}

export default function DesignCard({ design, startingPrice }: DesignCardProps) {
  const thumbnail = storageUrl(design.thumbnail_path);

  return (
    <Link
      href={`/marketplace-desain/${design.slug}`}
      className="flex w-[196px] flex-col gap-[7px] rounded-md border border-border bg-surface p-[11px]"
    >
      <div className="relative h-[142px] w-full shrink-0 overflow-hidden rounded-sm bg-border">
        {thumbnail && (
          <Image src={thumbnail} alt={design.title} fill sizes="196px" className="object-cover" />
        )}
        <WishlistButton designId={design.id} className="absolute right-2 top-2" />
      </div>
      <p className="font-body text-[12px] font-semibold text-text-primary">{design.title}</p>
      <div className="flex items-center gap-1.5">
        <span className="size-[14px] shrink-0 rounded-full bg-border" />
        <p className="font-body text-caption text-text-secondary">by {design.creator.name}</p>
      </div>
      {startingPrice !== undefined && (
        <p className="font-body text-[12px] font-semibold text-text-primary">
          Mulai dari {formatCurrency(startingPrice)}
        </p>
      )}
    </Link>
  );
}
