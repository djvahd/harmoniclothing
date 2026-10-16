"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import clsx from "clsx";
import { ImageOff } from "lucide-react";

/**
 * next/image that swaps to a neutral placeholder when the file fails to load
 * (deleted from storage, CDN hiccup) instead of showing the browser's broken-image icon.
 */
export default function SafeImage({ alt, onError, className, ...props }: ImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    const box = props.fill ? "absolute inset-0" : clsx("inline-flex shrink-0", className);
    return (
      <span
        role="img"
        aria-label={alt}
        style={props.fill ? undefined : { width: props.width, height: props.height }}
        className={clsx(box, "items-center justify-center bg-border text-text-secondary", props.fill && "flex")}
      >
        <ImageOff className="size-1/3 min-h-4 min-w-4 opacity-60" />
      </span>
    );
  }

  return (
    <Image
      alt={alt}
      className={className}
      {...props}
      onError={(e) => {
        setFailed(true);
        onError?.(e);
      }}
    />
  );
}
