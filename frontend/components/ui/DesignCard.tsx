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
  const price =
    startingPrice ??
    (design.products?.length
      ? Math.min(...design.products.map((p) => p.base_price))
      : undefined);

  return (
    <Link
      href={`/marketplace-desain/${design.slug}`}
      className="group flex w-[196px] flex-col gap-[5px] rounded-md border border-border bg-surface p-[11px] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
    >
      <div className="relative h-[155px] w-full shrink-0 overflow-hidden rounded-sm bg-border">
        {thumbnail && (
          <Image
            src={thumbnail}
            alt={design.title}
            fill
            sizes="196px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
        <WishlistButton designId={design.id} className="absolute right-2 top-2" />
      </div>
      <div className="flex flex-col gap-0">
        <p className="font-body text-body-sm text-text-primary transition-colors group-hover:text-primary">{design.title}</p>
        <div className="flex items-center gap-1.5">
          <span className="size-[14px] shrink-0 rounded-full bg-border" />
          <p className="font-body text-[11px] text-text-secondary">by {design.creator.name}</p>
        </div>
      </div>
      {price !== undefined && (
        <p className="font-body text-[12px] text-text-primary">
          Mulai dari {formatCurrency(price)}
        </p>
      )}
    </Link>
  );
}
