"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import AccountSidebar from "@/components/layout/AccountSidebar";
import SidebarPageShell from "@/components/layout/SidebarPageShell";
import ProductCard from "@/components/ui/ProductCard";
import DesignCard from "@/components/ui/DesignCard";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import { removeFromWishlist } from "@/services/wishlist";
import { useWishlist, invalidateWishlist } from "@/hooks/useWishlist";

export default function WishlistPage() {
  const { items, isLoading } = useWishlist();

  async function handleRemove(id: number) {
    await removeFromWishlist(id);
    invalidateWishlist();
  }

  return (
    <SidebarPageShell sidebar={<AccountSidebar />}>
      <div className="flex flex-col gap-6">
        <h1 className="font-heading text-h3 font-semibold text-text-primary">Wishlist</h1>

        {isLoading && <LoadingState rows={3} />}
        {!isLoading && items.length === 0 && (
          <EmptyState icon={Heart} title="Belum ada item di wishlist." />
        )}

        <div className="flex flex-wrap gap-6">
          {items.map((item) => (
            <div key={item.id} className="relative">
              <button
                onClick={() => handleRemove(item.id)}
                aria-label="Hapus dari wishlist"
                className="absolute right-3 top-3 z-10 flex size-8 items-center justify-center rounded-full bg-white shadow"
              >
                <Heart className="size-4 fill-danger text-danger" />
              </button>
              {item.product && <ProductCard product={item.product} />}
              {item.design && <DesignCard design={item.design} />}
              {!item.is_available && (
                <p className="mt-1 font-body text-xs text-danger">Tidak Tersedia</p>
              )}
            </div>
          ))}
        </div>
        {items.length === 0 && !isLoading && (
          <Link href="/catalog" className="font-body text-sm font-medium text-primary">
            Jelajahi Katalog
          </Link>
        )}
      </div>
    </SidebarPageShell>
  );
}
