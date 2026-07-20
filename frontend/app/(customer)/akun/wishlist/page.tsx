"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import useSWR, { mutate } from "swr";
import AccountSidebar from "@/components/layout/AccountSidebar";
import SidebarPageShell from "@/components/layout/SidebarPageShell";
import ProductCard from "@/components/ui/ProductCard";
import DesignCard from "@/components/ui/DesignCard";
import { getWishlist, removeFromWishlist } from "@/services/wishlist";

export default function WishlistPage() {
  const { data, isLoading } = useSWR("/wishlist", getWishlist);
  const items = data?.data ?? [];

  async function handleRemove(id: number) {
    await removeFromWishlist(id);
    mutate("/wishlist");
  }

  return (
    <SidebarPageShell sidebar={<AccountSidebar />}>
      <div className="flex flex-col gap-6">
        <h1 className="font-heading text-2xl font-semibold text-text-primary">Wishlist</h1>

        {isLoading && <p className="font-body text-sm text-text-secondary">Memuat wishlist...</p>}
        {!isLoading && items.length === 0 && (
          <p className="font-body text-sm text-text-secondary">Belum ada item di wishlist.</p>
        )}

        <div className="flex flex-wrap gap-6">
          {items.map((item) => (
            <div key={item.id} className="relative">
              <button
                onClick={() => handleRemove(item.id)}
                aria-label="Hapus dari wishlist"
                className="absolute right-3 top-3 z-10 flex size-8 items-center justify-center rounded-full bg-white shadow"
              >
                <Heart className="size-4 fill-red-500 text-red-500" />
              </button>
              {item.product && <ProductCard product={item.product} />}
              {item.design && <DesignCard design={item.design} />}
              {!item.is_available && (
                <p className="mt-1 font-body text-xs text-red-500">Tidak Tersedia</p>
              )}
            </div>
          ))}
        </div>
        {items.length === 0 && !isLoading && (
          <Link href="/katalog" className="font-body text-sm font-medium text-primary">
            Jelajahi Katalog
          </Link>
        )}
      </div>
    </SidebarPageShell>
  );
}
