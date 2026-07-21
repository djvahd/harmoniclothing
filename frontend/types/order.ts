import type { Design, ProductVariant } from "./product";

export type OrderStatus =
  | "belum_dibayar"
  | "menunggu_approval"
  | "diproses_produksi"
  | "dikirim"
  | "menunggu_konfirmasi"
  | "selesai"
  | "dibatalkan"
  | "ditolak";

export interface Shipment {
  courier: string;
  tracking_number: string | null;
  status: string;
  shipped_at: string | null;
  delivered_at: string | null;
}

export interface OrderItem {
  id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
  custom_design_file_path: string | null;
  design_position: Record<string, unknown> | null;
  product_variant: ProductVariant & { product?: { name: string; slug: string } };
  design: Design | null;
}

export interface Order {
  id: number;
  order_number: string;
  type: "reguler" | "bulk";
  status: OrderStatus;
  rejection_reason: string | null;
  notes: string | null;
  subtotal: number;
  shipping_cost: number;
  total: number;
  created_at: string;
  items: OrderItem[];
  shipment: Shipment | null;
  midtrans_redirect_url?: string | null;
}
