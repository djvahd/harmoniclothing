import type { BadgeVariant } from "@/components/ui/Badge";
import type { OrderStatus } from "@/types/order";

// Label text lives in locales/{id,en}.json under "common.orderStatus" (keyed
// by the same OrderStatus values) -- look it up via
// tCommon(`orderStatus.${status}`) instead of a static map, so it follows
// the active locale.
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
