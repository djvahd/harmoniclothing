"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import clsx from "clsx";
import AccountSidebar from "@/components/layout/AccountSidebar";
import SidebarPageShell from "@/components/layout/SidebarPageShell";
import Badge from "@/components/ui/Badge";
import ProductThumbnail from "@/components/ui/ProductThumbnail";
import { getOrders } from "@/services/orders";
import { storageUrl } from "@/lib/storage";
import { formatCurrency } from "@/lib/format";
import { ORDER_STATUS_LABEL, ORDER_STATUS_VARIANT } from "@/lib/order-status";
import type { OrderStatus } from "@/types/order";

const TABS: { value: OrderStatus | "semua"; label: string }[] = [
  { value: "semua", label: "Semua" },
  { value: "belum_dibayar", label: "Belum Dibayar" },
  { value: "menunggu_approval", label: "Menunggu Approval" },
  { value: "diproses_produksi", label: "Diproses" },
  { value: "dikirim", label: "Dikirim" },
  { value: "menunggu_konfirmasi", label: "Menunggu Konfirmasi" },
  { value: "selesai", label: "Selesai" },
  { value: "dibatalkan", label: "Dibatalkan" },
  { value: "ditolak", label: "Ditolak" },
];

export default function RiwayatPesananPage() {
  const { data, isLoading } = useSWR("/orders", getOrders);
  const [tab, setTab] = useState<OrderStatus | "semua">("semua");

  const orders = (data?.data ?? []).filter((order) => tab === "semua" || order.status === tab);

  return (
    <SidebarPageShell sidebar={<AccountSidebar />}>
      <div className="flex flex-col gap-6">
        <h1 className="font-heading text-2xl font-semibold text-text-primary">
          Riwayat Pesanan
        </h1>

        <div className="flex gap-2 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={clsx(
                "shrink-0 rounded-full px-4 py-2 font-body text-sm font-medium",
                tab === t.value
                  ? "bg-primary text-text-on-accent"
                  : "border border-border text-text-secondary",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {isLoading && <p className="font-body text-sm text-text-secondary">Memuat pesanan...</p>}
        {!isLoading && orders.length === 0 && (
          <p className="font-body text-sm text-text-secondary">Belum ada pesanan.</p>
        )}

        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <div key={order.id} className="flex flex-col gap-3 rounded-md border border-border bg-surface p-4">
              <div className="flex items-center justify-between">
                <p className="font-body text-sm font-semibold text-text-primary">
                  {order.order_number}
                </p>
                <Badge variant={ORDER_STATUS_VARIANT[order.status]}>
                  {ORDER_STATUS_LABEL[order.status]}
                </Badge>
              </div>
              <div className="flex gap-2">
                {order.items.slice(0, 3).map((item) => (
                  <ProductThumbnail
                    key={item.id}
                    src={storageUrl(
                      item.design?.thumbnail_path ?? item.product_variant.mockup_asset_path,
                    )}
                    alt={item.product_variant.product?.name ?? "Produk"}
                    size={56}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between">
                <p className="font-body text-sm font-semibold text-text-primary">
                  {formatCurrency(order.total)}
                </p>
                <Link
                  href={`/akun/pesanan/${order.id}`}
                  className="font-body text-sm font-medium text-primary"
                >
                  Lihat Detail
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SidebarPageShell>
  );
}
