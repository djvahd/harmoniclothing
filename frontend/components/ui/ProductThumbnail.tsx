import Image from "next/image";
import clsx from "clsx";

interface ProductThumbnailProps {
  src?: string | null;
  alt: string;
  size?: number;
  className?: string;
}

export default function ProductThumbnail({
  src,
  alt,
  size = 64,
  className,
}: ProductThumbnailProps) {
  return (
    <div
      className={clsx("relative shrink-0 overflow-hidden rounded-sm bg-border", className)}
      style={{ width: size, height: size }}
    >
      {src && (
        <Image src={src} alt={alt} fill sizes={`${size}px`} className="object-cover" />
      )}
    </div>
  );
}
