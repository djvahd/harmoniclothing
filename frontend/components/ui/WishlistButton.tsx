"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import useSWR, { mutate } from "swr";
import clsx from "clsx";
import { useAuthStore } from "@/store/auth-store";
import { getWishlist, addToWishlist, removeFromWishlist } from "@/services/wishlist";

interface WishlistButtonProps {
  productId?: number;
  designId?: number;
  className?: string;
}

export default function WishlistButton({ productId, designId, className }: WishlistButtonProps) {
  const user = useAuthStore((state) => state.user);
  const { data } = useSWR(user ? "/wishlist" : null, getWishlist);
  const [pending, setPending] = useState(false);

  const items = data?.data ?? [];
  const existing = items.find((item) =>
    productId ? item.product?.id === productId : item.design?.id === designId,
  );

  if (!user) return null;

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (pending) return;
    setPending(true);
    try {
      if (existing) {
        await removeFromWishlist(existing.id);
      } else {
        await addToWishlist({ product_id: productId, design_id: designId });
      }
      await mutate("/wishlist");
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      aria-label={existing ? "Hapus dari wishlist" : "Tambah ke wishlist"}
      onClick={handleClick}
      disabled={pending}
      className={clsx(
        "flex size-8 items-center justify-center rounded-full bg-white shadow-[0px_2px_8px_0px_rgba(0,0,0,0.15)] disabled:opacity-60",
        className,
      )}
    >
      <Heart
        className={clsx(
          "size-4",
          existing ? "fill-accent text-accent" : "text-text-secondary",
        )}
      />
    </button>
  );
}
