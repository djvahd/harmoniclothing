import type { Design, ProductVariant, Review } from "./product";

/** BR-012 tiered pricing for Bulk Order — total quantity across all variants of one product picks a single tier. */
export interface BulkPricingTier {
  min_qty: number;
  max_qty: number | null;
  price_per_unit: number;
}

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
  courier_type: string | null;
  tracking_number: string | null;
  status: string;
  shipped_at: string | null;
  delivered_at: string | null;
}

/** Options returned by POST /checkout/shipping-rates. */
export interface ShippingRate {
  courier_company: string;
  courier_type: string;
  courier_service_name: string;
  price: number;
  duration: string | null;
}

export interface OrderItem {
  id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
  custom_design_file_path: string | null;
  custom_design_url: string | null;
  /** Original file of a marketplace design (not its thumbnail) — what gets printed. */
  design_file_url: string | null;
  design_position: Record<string, unknown> | null;
  product_variant: ProductVariant & { product?: { name: string; slug: string } };
  design: Design | null;
  review: Review | null;
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
  courier_company: string | null;
  courier_type: string | null;
  total: number;
  created_at: string;
  /** Only on GET /admin/orders. */
  user?: { id: number; name: string; email: string };
  items: OrderItem[];
  shipment: Shipment | null;
  /** When each status was reached; only present on the order detail endpoint. */
  status_history?: { status: OrderStatus; at: string }[];
  midtrans_redirect_url?: string | null;
}
