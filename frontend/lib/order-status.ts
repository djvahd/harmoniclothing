import type { BadgeVariant } from "@/components/ui/Badge";
import type { OrderStatus } from "@/types/order";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  belum_dibayar: "Belum Dibayar",
  menunggu_approval: "Menunggu Approval",
  diproses_produksi: "Diproses",
  dikirim: "Dikirim",
  menunggu_konfirmasi: "Menunggu Konfirmasi",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
  ditolak: "Ditolak",
};

export const ORDER_STATUS_VARIANT: Record<OrderStatus, BadgeVariant> = {
  belum_dibayar: "warning",
  menunggu_approval: "info",
  diproses_produksi: "info",
  dikirim: "info",
  menunggu_konfirmasi: "info",
  selesai: "success",
  dibatalkan: "danger",
  ditolak: "danger",
};
