import type { BadgeVariant } from "@/components/ui/Badge";
import type { OrderStatus } from "@/types/order";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  belum_dibayar: "Belum Dibayar",
  menunggu_approval: "Menunggu Approval",
  diproses_produksi: "Diproses",
  dikirim: "Dikirim",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
};

export const ORDER_STATUS_VARIANT: Record<OrderStatus, BadgeVariant> = {
  belum_dibayar: "warning",
  menunggu_approval: "info",
  diproses_produksi: "info",
  dikirim: "info",
  selesai: "success",
  dibatalkan: "danger",
};
