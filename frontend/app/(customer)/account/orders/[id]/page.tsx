"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import useSWR, { mutate } from "swr";
import { useState } from "react";
import Badge from "@/components/ui/Badge";
import OrderStatusItem from "@/components/ui/OrderStatusItem";
import ProductThumbnail from "@/components/ui/ProductThumbnail";
import PriceSummaryRow from "@/components/ui/PriceSummaryRow";
import Button from "@/components/ui/Button";
import { cancelOrder, confirmReceived, getOrder, reorder } from "@/services/orders";
import { storageUrl } from "@/lib/storage";
import { formatCurrency } from "@/lib/format";
import { ORDER_STATUS_LABEL, ORDER_STATUS_VARIANT } from "@/lib/order-status";

const TIMELINE_STEPS: { status: string; label: string }[] = [
  { status: "belum_dibayar", label: "Pesanan Dibuat" },
  { status: "menunggu_approval", label: "Menunggu Approval" },
  { status: "diproses_produksi", label: "Pesanan Diproduksi" },
  { status: "dikirim", label: "Pesanan Dikirim" },
  { status: "menunggu_konfirmasi", label: "Menunggu Konfirmasi" },
  { status: "selesai", label: "Pesanan Selesai" },
];

export default function DetailPesananPage() {
  const params = useParams<{ id: string }>();
  const orderId = Number(params.id);
  const { data, isLoading } = useSWR(`/orders/${orderId}`, () => getOrder(orderId));
  const [loading, setLoading] = useState(false);
  const order = data?.data;

  const currentStepIndex = order
    ? TIMELINE_STEPS.findIndex((s) => s.status === order.status)
    : -1;

  async function handleCancel() {
    setLoading(true);
    try {
      await cancelOrder(orderId);
      mutate(`/orders/${orderId}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleReorder() {
    setLoading(true);
    try {
      await reorder(orderId);
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmReceived() {
    setLoading(true);
    try {
      await confirmReceived(orderId);
      mutate(`/orders/${orderId}`);
    } finally {
      setLoading(false);
    }
  }

  if (isLoading) return <p className="p-8 font-body text-sm text-text-secondary">Memuat pesanan...</p>;
  if (!order) return <p className="p-8 font-body text-sm text-text-secondary">Pesanan tidak ditemukan.</p>;

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 py-8 md:flex-row md:px-20">
      <div className="flex flex-1 flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-h3 font-semibold text-text-primary">
            {order.order_number}
          </h1>
          <Badge variant={ORDER_STATUS_VARIANT[order.status]}>
            {ORDER_STATUS_LABEL[order.status]}
          </Badge>
        </div>

        {order.status === "ditolak" && order.rejection_reason && (
          <div className="rounded-md border border-red-200 bg-red-50 p-4">
            <p className="font-body text-sm font-semibold text-red-700">Pesanan Ditolak</p>
            <p className="font-body text-sm text-red-600">{order.rejection_reason}</p>
          </div>
        )}

        {order.status !== "dibatalkan" && order.status !== "ditolak" && (
          <div className="rounded-md border border-border bg-surface p-5">
            {TIMELINE_STEPS.map((step, i) => (
              <OrderStatusItem
                key={step.status}
                title={step.label}
                timestamp={i <= currentStepIndex ? "Selesai" : "Menunggu"}
                done={i <= currentStepIndex}
                isLast={i === TIMELINE_STEPS.length - 1}
              />
            ))}
          </div>
        )}

        <div className="flex flex-col gap-3 rounded-md border border-border bg-surface p-5">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <ProductThumbnail
                src={storageUrl(item.design?.thumbnail_path ?? item.product_variant.mockup_asset_path)}
                alt={item.product_variant.product?.name ?? "Produk"}
              />
              <div className="flex flex-1 flex-col">
                <p className="font-body text-sm font-semibold text-text-primary">
                  {item.product_variant.product?.name}
                </p>
                <p className="font-body text-xs text-text-secondary">
                  {item.product_variant.size} · {item.product_variant.color} · x{item.quantity}
                </p>
              </div>
              <p className="font-body text-sm font-semibold text-text-primary">
                {formatCurrency(item.subtotal)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex w-full flex-col gap-4 rounded-md border border-border bg-surface p-5 md:w-[320px]">
        <p className="font-heading text-lg font-semibold text-text-primary">Ringkasan</p>
        <PriceSummaryRow label="Subtotal" amount={order.subtotal} />
        <PriceSummaryRow label="Ongkos Kirim" amount={order.shipping_cost} />
        <div className="border-t border-border pt-3">
          <PriceSummaryRow label="Total" amount={order.total} emphasis />
        </div>

        {order.shipment?.tracking_number && (
          <p className="font-body text-xs text-text-secondary">
            {order.shipment.courier} - Resi: {order.shipment.tracking_number}
          </p>
        )}

        <div className="flex flex-col gap-2 pt-2">
          {order.status === "menunggu_approval" && (
            <Button variant="danger" loading={loading} onClick={handleCancel}>
              Batalkan Pesanan
            </Button>
          )}
          {order.status === "menunggu_konfirmasi" && (
            <Button loading={loading} onClick={handleConfirmReceived}>
              Konfirmasi Diterima
            </Button>
          )}
          {order.status === "selesai" && (
            <Button variant="secondary" loading={loading} onClick={handleReorder}>
              Pesan Lagi
            </Button>
          )}
          <Link href={`/account/orders/${order.id}/invoice`}>
            <Button variant="secondary" fullWidth>
              Lihat Invoice
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
