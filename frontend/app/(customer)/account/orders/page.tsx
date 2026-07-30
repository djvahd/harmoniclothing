"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { PackageSearch } from "lucide-react";
import { useTranslations } from "next-intl";
import AccountSidebar from "@/components/layout/AccountSidebar";
import SidebarPageShell from "@/components/layout/SidebarPageShell";
import Badge from "@/components/ui/Badge";
import ProductThumbnail from "@/components/ui/ProductThumbnail";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import { useOrders } from "@/hooks/useOrders";
import { storageUrl } from "@/lib/storage";
import { formatCurrency } from "@/lib/format";
import { ORDER_STATUS_VARIANT } from "@/lib/order-status";
import type { OrderStatus } from "@/types/order";

const TABS: (OrderStatus | "semua")[] = [
  "semua",
  "belum_dibayar",
  "menunggu_approval",
  "diproses_produksi",
  "dikirim",
  "menunggu_konfirmasi",
  "selesai",
  "dibatalkan",
  "ditolak",
];

export default function RiwayatPesananPage() {
  const t = useTranslations("customer.orders");
  const tCommon = useTranslations("common");
  const { orders: allOrders, isLoading } = useOrders();
  const [tab, setTab] = useState<OrderStatus | "semua">("semua");

  const orders = allOrders.filter((order) => tab === "semua" || order.status === tab);

  return (
    <SidebarPageShell sidebar={<AccountSidebar />}>
      <div className="flex flex-col gap-6">
        <h1 className="font-heading text-h3 font-semibold text-text-primary">
          {t("title")}
        </h1>

        <div className="flex gap-2 overflow-x-auto">
          {TABS.map((value) => (
            <button
              key={value}
              onClick={() => setTab(value)}
              className={clsx(
                "shrink-0 rounded-full px-4 py-2 font-body text-sm font-medium",
                tab === value
                  ? "bg-primary text-text-on-accent"
                  : "border border-border text-text-secondary",
              )}
            >
              {value === "semua" ? t("statusAll") : tCommon(`orderStatus.${value}`)}
            </button>
          ))}
        </div>

        {isLoading && <LoadingState rows={3} />}
        {!isLoading && orders.length === 0 && (
          <EmptyState icon={PackageSearch} title={t("empty")} />
        )}

        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <div key={order.id} className="flex flex-col gap-3 rounded-md border border-border bg-surface p-4">
              <div className="flex items-center justify-between">
                <p className="font-body text-sm font-semibold text-text-primary">
                  {order.order_number}
                </p>
                <Badge variant={ORDER_STATUS_VARIANT[order.status]}>
                  {tCommon(`orderStatus.${order.status}`)}
                </Badge>
              </div>
              <div className="flex gap-2">
                {order.items.slice(0, 3).map((item) => (
                  <ProductThumbnail
                    key={item.id}
                    src={storageUrl(
                      item.design?.thumbnail_path ?? item.product_variant.mockup_asset_path,
                    )}
                    alt={item.product_variant.product?.name ?? tCommon("productFallback")}
                    size={56}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between">
                <p className="font-body text-sm font-semibold text-text-primary">
                  {formatCurrency(order.total)}
                </p>
                <Link
                  href={`/account/orders/${order.id}`}
                  className="font-body text-sm font-medium text-primary"
                >
                  {t("viewDetail")}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SidebarPageShell>
  );
}
