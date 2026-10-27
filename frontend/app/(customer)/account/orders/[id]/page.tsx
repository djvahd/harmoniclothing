"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Badge from "@/components/ui/Badge";
import OrderStatusItem from "@/components/ui/OrderStatusItem";
import ProductThumbnail from "@/components/ui/ProductThumbnail";
import PriceSummaryRow from "@/components/ui/PriceSummaryRow";
import Button from "@/components/ui/Button";
import LoadingState from "@/components/ui/LoadingState";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import OrderItemReview from "@/components/order/OrderItemReview";
import { cancelOrder, confirmReceived, payOrder, reorder } from "@/services/orders";
import { useOrder, invalidateOrder, refreshAfterPayment } from "@/hooks/useOrders";
import { invalidateCart } from "@/hooks/useCart";
import { toast } from "@/store/toast-store";
import { storageUrl } from "@/lib/storage";
import { payWithSnap } from "@/lib/snap";
import { formatCurrency, formatDateTime } from "@/lib/format";
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
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const orderId = Number(params.id);
  const { order, isLoading } = useOrder(orderId);
  const [loading, setLoading] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);

  // Arriving from checkout right after the Snap popup: wait for the webhook.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("paying")) void refreshAfterPayment(orderId);
  }, [orderId]);

  const currentStepIndex = order
    ? TIMELINE_STEPS.findIndex((s) => s.status === order.status)
    : -1;

  /** Real time the step was reached (status history); falls back to "Selesai"/"Menunggu" without one. */
  function stepTimestamp(status: string, index: number): string {
    if (index > currentStepIndex) return t("timelinePending");
    const reached =
      status === "belum_dibayar"
        ? order?.created_at
        : order?.status_history?.find((h) => h.status === status)?.at;
    return reached ? formatDateTime(reached) : t("timelineDone");
  }

  async function handleCancel() {
    setCancelOpen(false);
    setLoading(true);
    try {
      await cancelOrder(orderId);
      invalidateOrder(orderId);
    } catch {
      toast(t("actionFailed"), "danger");
    } finally {
      setLoading(false);
    }
  }

  async function handlePay() {
    setLoading(true);
    setPayError(null);
    try {
      const res = await payOrder(orderId);
      const url = res.data.midtrans_redirect_url;
      if (url) {
        await payWithSnap(url, () => void refreshAfterPayment(orderId));
        return;
      }
      setPayError(t("payUnavailable"));
    } catch {
      setPayError(t("payFailed"));
    } finally {
      setLoading(false);
    }
  }

  async function handleReorder() {
    setLoading(true);
    try {
      await reorder(orderId);
      void invalidateCart();
      toast(t("reorderSuccess"), "success");
      router.push("/cart");
    } catch {
      toast(t("actionFailed"), "danger");
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmReceived() {
    setLoading(true);
    try {
      await confirmReceived(orderId);
      invalidateOrder(orderId);
    } catch {
      toast(t("actionFailed"), "danger");
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
                timestamp={stepTimestamp(step.status, i)}
                done={i <= currentStepIndex}
                isLast={i === TIMELINE_STEPS.length - 1}
              />
            ))}
          </div>
        )}

        {order.address && (
          <div className="flex flex-col gap-1 rounded-md border border-border bg-surface p-5">
            <p className="font-body text-sm font-semibold text-text-primary">{t("shippingAddress")}</p>
            <p className="font-body text-sm text-text-primary">
              {order.address.recipient_name} · {order.address.phone}
            </p>
            <p className="font-body text-sm text-text-secondary">
              {order.address.address_line}, {order.address.district}, {order.address.city}, {order.address.province}{" "}
              {order.address.postal_code}
            </p>
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
              {item.custom_design_url && (
                <div className="flex items-center gap-3 pl-1">
                  <ProductThumbnail src={item.custom_design_url} alt={t("designPreviewAlt")} size={48} />
                  <p className="font-body text-xs text-text-secondary">{t("designPreviewLabel")}</p>
                </div>
              )}
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

        {order.courier_company && (
          <p className="font-body text-xs text-text-secondary">
            {t("courier")}: {[order.courier_company, order.courier_type].filter(Boolean).join(" ").toUpperCase()}
          </p>
        )}
        {order.status === "belum_dibayar" && (
          <p className="font-body text-xs text-text-secondary">
            {t("payBefore", { date: formatDateTime(new Date(new Date(order.created_at).getTime() + 24 * 60 * 60 * 1000).toISOString()) })}
          </p>
        )}

        {order.shipment?.tracking_number && (
          <p className="font-body text-xs text-text-secondary">
            {order.shipment.courier} - {t("trackingNumber")}: {order.shipment.tracking_number}
          </p>
        )}

        <div className="flex flex-col gap-2 pt-2">
          {order.status === "belum_dibayar" && (
            <>
              <Button loading={loading} onClick={handlePay}>
                {t("payNow")}
              </Button>
              {payError && (
                <p role="alert" className="font-body text-xs text-danger">
                  {payError}
                </p>
              )}
            </>
          )}
          {(order.status === "menunggu_approval" || order.status === "belum_dibayar") && (
            // Outlined, not solid red, so it does not compete with "Pay now"; the confirm dialog still guards it.
            <Button
              variant="secondary"
              className="mt-2 !border-danger !text-danger hover:!bg-danger hover:!text-danger-fg"
              loading={loading}
              onClick={() => setCancelOpen(true)}
            >
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
          {/* An invoice exists only once payment succeeded (FR-018). */}
          {order.status !== "belum_dibayar" && order.status !== "dibatalkan" && (
            <Button href={`/account/orders/${order.id}/invoice`} variant="secondary" fullWidth>
              {t("viewInvoice")}
            </Button>
          )}
        </div>
      </div>
      <ConfirmDialog
        open={cancelOpen}
        title={t("cancelConfirmTitle")}
        message={t("cancelConfirmMessage")}
        confirmLabel={t("cancelConfirmYes")}
        cancelLabel={tCommon("cancel")}
        onConfirm={handleCancel}
        onCancel={() => setCancelOpen(false)}
      />
    </div>
  );
}
