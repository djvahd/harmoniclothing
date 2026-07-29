import type { ReactNode } from "react";
import Image from "next/image";
import clsx from "clsx";
import { storageUrl } from "@/lib/storage";

export interface GalleryItem {
  key: string;
  path: string;
}

export default function ProductGallery({
  previewImage,
  alt,
  isLaris,
  wishlist,
  items,
  activeKey,
  onSelectItem,
}: {
  previewImage?: string;
  alt: string;
  isLaris: boolean;
  wishlist: ReactNode;
  items: GalleryItem[];
  activeKey?: string;
  onSelectItem: (key: string) => void;
}) {
  return (
    <div className="flex w-full shrink-0 flex-col gap-3 md:w-[480px]">
      <div className="relative h-[420px] w-full overflow-hidden rounded-md bg-border">
        {previewImage && (
          <Image
            src={previewImage}
            alt={alt}
            fill
            sizes="(min-width: 768px) 480px, 100vw"
            className="object-cover"
            priority
          />
        )}
        {isLaris && (
          <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 font-body text-xs font-semibold text-text-on-accent">
            Terlaris
          </span>
        )}
        {wishlist}
      </div>
      {items.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {items.map((item) => {
            const thumb = storageUrl(item.path);
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onSelectItem(item.key)}
                className={clsx(
                  "relative size-16 shrink-0 overflow-hidden rounded-sm border-2 bg-border transition-colors",
                  (activeKey ?? items[0].key) === item.key
                    ? "border-accent"
                    : "border-transparent hover:border-primary/40",
                )}
              >
                {thumb && <Image src={thumb} alt="" fill sizes="64px" className="object-cover" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
