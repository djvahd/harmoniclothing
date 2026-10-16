import SafeImage from "@/components/ui/SafeImage";
import clsx from "clsx";

interface ProductThumbnailProps {
  src?: string | null;
  alt: string;
  size?: number;
  className?: string;
}

/** Fixed-size square product/design image, blank placeholder when `src` is missing. */
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
        <SafeImage src={src} alt={alt} fill sizes={`${size}px`} className="object-cover" />
      )}
    </div>
  );
}
