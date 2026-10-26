"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import clsx from "clsx";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/store/auth-store";
import { useAuthModalStore } from "@/store/auth-modal-store";
import { addToWishlist, removeFromWishlist } from "@/services/wishlist";
import { useWishlist, invalidateWishlist } from "@/hooks/useWishlist";

interface WishlistButtonProps {
  productId?: number;
  designId?: number;
  className?: string;
}

export default function WishlistButton({ productId, designId, className }: WishlistButtonProps) {
  const t = useTranslations("ui.wishlistButton");
  const user = useAuthStore((state) => state.user);
  const openAuthModal = useAuthModalStore((state) => state.open);
  const { items } = useWishlist(user?.role === "customer");
  const [pending, setPending] = useState(false);

  const existing = items.find((item) =>
    productId ? item.product?.id === productId : item.design?.id === designId,
  );

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      openAuthModal("login");
      return;
    }
    if (pending) return;
    setPending(true);
    try {
      if (existing) {
        await removeFromWishlist(existing.id);
      } else {
        await addToWishlist({ product_id: productId, design_id: designId });
      }
      await invalidateWishlist();
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      aria-label={existing ? t("removeAria") : t("addAria")}
      aria-pressed={!!existing}
      onClick={handleClick}
      disabled={pending}
      className={clsx(
        "flex size-8 items-center justify-center rounded-full bg-white/40 backdrop-blur-[2px] transition-transform duration-150 hover:scale-110 hover:bg-white/55 active:scale-95 disabled:opacity-60 disabled:hover:scale-100",
        className,
      )}
    >
      <Heart
        className={clsx(
          "size-4 transition-colors",
          existing ? "fill-accent text-accent" : "text-text-secondary",
        )}
      />
    </button>
  );
}
