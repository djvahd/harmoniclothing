"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import Badge from "@/components/ui/Badge";
import OrderStatusItem from "@/components/ui/OrderStatusItem";
import ProductThumbnail from "@/components/ui/ProductThumbnail";
import PriceSummaryRow from "@/components/ui/PriceSummaryRow";
import Button from "@/components/ui/Button";
import LoadingState from "@/components/ui/LoadingState";
import OrderItemReview from "@/components/order/OrderItemReview";
import { cancelOrder, confirmReceived, reorder } from "@/services/orders";
import { useOrder, invalidateOrder } from "@/hooks/useOrders";
import { storageUrl } from "@/lib/storage";
import { formatCurrency } from "@/lib/format";
import { ORDER_STATUS_VARIANT } from "@/lib/order-status";

const TIMELINE_STEPS: { status: string; tKey: string }[] = [
  { status: "belum_dibayar", tKey: "orderCreated" },
  { status: "menunggu_approval", tKey: "awaitingApproval" },
  { status: "diproses_produksi", tKey: "inProduction" },
  { status: "dikirim", tKey: "shipped" },
  { status: "menunggu_konfirmasi", tKey: "awaitingConfirmation" },
  { status: "selesai", tKey: "completed" },
];

export default function DetailPesananPage() {
  const t = useTranslations("customer.orderDetail");
  const tCommon = useTranslations("common");
  const params = useParams<{ id: string }>();
  const orderId = Number(params.id);
  const { order, isLoading } = useOrder(orderId);
  const [loading, setLoading] = useState(false);

  const currentStepIndex = order
    ? TIMELINE_STEPS.findIndex((s) => s.status === order.status)
    : -1;

  async function handleCancel() {
    setLoading(true);
    try {
      await cancelOrder(orderId);
      invalidateOrder(orderId);
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
      invalidateOrder(orderId);
    } finally {
      setLoading(false);
    }
  }

  if (isLoading) return <LoadingState variant="detail" />;
  if (!order) return <p className="p-8 font-body text-sm text-text-secondary">{t("notFound")}</p>;

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 py-8 md:flex-row md:px-20">
      <div className="flex flex-1 flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-h3 font-semibold text-text-primary">
            {order.order_number}
          </h1>
          <Badge variant={ORDER_STATUS_VARIANT[order.status]}>
            {tCommon(`orderStatus.${order.status}`)}
          </Badge>
        </div>

        {order.status === "ditolak" && order.rejection_reason && (
          <div className="rounded-md border border-danger/20 bg-danger/5 p-4">
            <p className="font-body text-sm font-semibold text-danger">{t("rejectedTitle")}</p>
            <p className="font-body text-sm text-danger">{order.rejection_reason}</p>
          </div>
        )}

        {order.status !== "dibatalkan" && order.status !== "ditolak" && (
          <div className="rounded-md border border-border bg-surface p-5">
            {TIMELINE_STEPS.map((step, i) => (
              <OrderStatusItem
                key={step.status}
                title={t(`timeline.${step.tKey}`)}
                timestamp={i <= currentStepIndex ? t("timelineDone") : t("timelinePending")}
                done={i <= currentStepIndex}
                isLast={i === TIMELINE_STEPS.length - 1}
              />
            ))}
          </div>
        )}

        <div className="flex flex-col gap-3 rounded-md border border-border bg-surface p-5">
          {order.items.map((item) => (
            <div key={item.id} className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <ProductThumbnail
                  src={storageUrl(item.design?.thumbnail_path ?? item.product_variant.mockup_asset_path)}
                  alt={item.product_variant.product?.name ?? tCommon("productFallback")}
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
              {order.status === "selesai" && (
                <OrderItemReview
                  orderId={order.id}
                  orderItemId={item.id}
                  review={item.review}
                  onSubmitted={() => invalidateOrder(order.id)}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex w-full flex-col gap-4 rounded-md border border-border bg-surface p-5 md:w-[320px]">
        <p className="font-heading text-lg font-semibold text-text-primary">{t("summary")}</p>
        <PriceSummaryRow label={t("subtotal")} amount={order.subtotal} />
        <PriceSummaryRow label={t("shippingCost")} amount={order.shipping_cost} />
        <div className="border-t border-border pt-3">
          <PriceSummaryRow label={t("total")} amount={order.total} emphasis />
        </div>

        {order.shipment?.tracking_number && (
          <p className="font-body text-xs text-text-secondary">
            {order.shipment.courier} - {t("trackingNumber")}: {order.shipment.tracking_number}
          </p>
        )}

        <div className="flex flex-col gap-2 pt-2">
          {order.status === "menunggu_approval" && (
            <Button variant="danger" loading={loading} onClick={handleCancel}>
              {t("cancelOrder")}
            </Button>
          )}
          {order.status === "menunggu_konfirmasi" && (
            <Button loading={loading} onClick={handleConfirmReceived}>
              {t("confirmReceived")}
            </Button>
          )}
          {order.status === "selesai" && (
            <Button variant="secondary" loading={loading} onClick={handleReorder}>
              {t("reorder")}
            </Button>
          )}
          <Link href={`/account/orders/${order.id}/invoice`}>
            <Button variant="secondary" fullWidth>
              {t("viewInvoice")}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
