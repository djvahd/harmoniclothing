"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { Truck } from "lucide-react";
import { useTranslations } from "next-intl";
import AdminSidebar from "@/components/layout/AdminSidebar";
import SidebarPageShell from "@/components/layout/SidebarPageShell";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Portal from "@/components/ui/Portal";
import DataTable from "@/components/ui/DataTable";
import EmptyState from "@/components/ui/EmptyState";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { bookShipment, getCouriers, getProductionQueue } from "@/services/admin";
import type { Order } from "@/types/order";

const SELECT_CLASS =
  "rounded-sm border border-border bg-surface px-3 py-2.5 font-body text-sm text-text-primary outline-none";

/** Picks the replacement courier from the server's validated list; confirms as "company:type". */
function CourierOverrideModal({ open, onConfirm, onCancel }: { open: boolean; onConfirm: (value: string) => void; onCancel: () => void }) {
  const t = useTranslations("admin.shipments.overrideModal");
  const tCommon = useTranslations("common");
  const { data } = useSWR(open ? "/admin/shipping/couriers" : null, getCouriers);
  const options = (data?.data ?? []).flatMap((c) => c.types.map((type) => `${c.company}:${type}`));
  const [value, setValue] = useState("");
  useEscapeKey(open, onCancel);
  const dialogRef = useFocusTrap<HTMLDivElement>(open);

  if (!open) return null;
  const selected = value || options[0] || "";

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-black/45 px-4">
        <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label={t("title")} className="flex w-full max-w-sm flex-col gap-4 rounded-md bg-surface p-6">
          <p className="font-heading text-lg font-semibold text-text-primary">{t("title")}</p>
          <label className="flex flex-col gap-1.5 font-body text-sm text-text-primary">
            {t("label")}
            <select value={selected} onChange={(e) => setValue(e.target.value)} className={SELECT_CLASS} autoFocus>
              {options.map((o) => (
                <option key={o} value={o}>{o.replace(":", " ").toUpperCase()}</option>
              ))}
            </select>
          </label>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={onCancel}>{tCommon("cancel")}</Button>
            <Button disabled={!selected} onClick={() => onConfirm(selected)}>{t("confirm")}</Button>
          </div>
        </div>
      </div>
    </Portal>
  );
}

export default function KelolaPengirimanPage() {
  const t = useTranslations("admin.shipments");
  const { data, isLoading } = useSWR("/admin/production-queue", getProductionQueue);
  const orders = (data?.data ?? []).filter((o) => o.status === "diproses_produksi");
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [overrideId, setOverrideId] = useState<number | null>(null);

  /** Books directly using whatever courier the customer already chose (and paid shipping for) at checkout — no admin input needed. */
  async function handleBook(id: number) {
    setLoadingId(id);
    try {
      await bookShipment(id);
      mutate("/admin/production-queue");
    } finally {
      setLoadingId(null);
    }
  }

  /** Only used when the checkout-time courier turns out unavailable — value is "company:type", e.g. "jne:reg". */
  async function handleOverride(value: string) {
    if (overrideId === null) return;
    const id = overrideId;
    const [courier_company, courier_type] = value.split(":");
    setOverrideId(null);
    setLoadingId(id);
    try {
      await bookShipment(id, { courier_company, courier_type });
      mutate("/admin/production-queue");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <SidebarPageShell sidebar={<AdminSidebar />}>
      <div className="flex flex-col gap-6">
        <h1 className="font-heading text-h3 font-semibold text-text-primary">
          {t("title")}
        </h1>
        <DataTable<Order>
          columns={[
            { key: "order_number", header: t("columns.orderNumber") },
            { key: "checkoutCourier", header: t("columns.checkoutCourier") },
            { key: "courier", header: t("columns.courier") },
            { key: "tracking", header: t("columns.tracking") },
            { key: "status", header: t("columns.status") },
            { key: "actions", header: t("columns.actions") },
          ]}
          data={orders}
          isLoading={isLoading}
          getRowKey={(order) => order.id}
          emptyState={
            <EmptyState icon={Truck} title={t("empty")} />
          }
          renderRow={(order) => (
            <tr className="border-b border-border last:border-0">
              <td className="p-4 font-medium text-text-primary">{order.order_number}</td>
              <td className="p-4 text-text-secondary">
                {order.courier_company ? `${order.courier_company} ${order.courier_type ?? ""}`.trim().toUpperCase() : "-"}
              </td>
              <td className="p-4 text-text-secondary">{order.shipment?.courier ?? "-"}</td>
              <td className="p-4 text-text-secondary">{order.shipment?.tracking_number ?? "-"}</td>
              <td className="p-4">
                <Badge variant={order.shipment ? "success" : "neutral"}>
                  {order.shipment ? t("booked") : t("notBooked")}
                </Badge>
              </td>
              <td className="p-4">
                {!order.shipment && (
                  <div className="flex gap-2">
                    <Button loading={loadingId === order.id} onClick={() => handleBook(order.id)}>
                      {t("bookCourier")}
                    </Button>
                    <Button
                      variant="secondary"
                      disabled={loadingId === order.id}
                      onClick={() => setOverrideId(order.id)}
                    >
                      {t("overrideCourier")}
                    </Button>
                  </div>
                )}
              </td>
            </tr>
          )}
        />
      </div>
      <CourierOverrideModal
        open={overrideId !== null}
        onConfirm={handleOverride}
        onCancel={() => setOverrideId(null)}
      />
    </SidebarPageShell>
  );
}
