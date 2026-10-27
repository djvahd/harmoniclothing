"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import AccountSidebar from "@/components/layout/AccountSidebar";
import SidebarPageShell from "@/components/layout/SidebarPageShell";
import ProductCard from "@/components/ui/ProductCard";
import DesignCard from "@/components/ui/DesignCard";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import { useWishlist } from "@/hooks/useWishlist";

export default function WishlistPage() {
  const t = useTranslations("customer.wishlist");
  const { items, isLoading } = useWishlist();

  return (
    <SidebarPageShell sidebar={<AccountSidebar />}>
      <div className="flex flex-col gap-6">
        <h1 className="font-heading text-h3 font-semibold text-text-primary">{t("title")}</h1>

        {isLoading && <LoadingState rows={3} />}
        {!isLoading && items.length === 0 && (
          <EmptyState icon={Heart} title={t("empty")} />
        )}

        <div className="grid grid-cols-2 justify-items-center gap-3 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4 xl:grid-cols-5">
          {items.map((item) => (
            <div key={item.id} className="relative">
              {item.product && <ProductCard product={item.product} />}
              {item.design && <DesignCard design={item.design} />}
              {!item.is_available && (
                <p className="mt-1 font-body text-xs text-danger">{t("unavailable")}</p>
              )}
            </div>
          ))}
        </div>
        {items.length === 0 && !isLoading && (
          <Link href="/produk" className="font-body text-sm font-medium text-primary">
            {t("browseCatalog")}
          </Link>
        )}
      </div>
    </SidebarPageShell>
  );
}
