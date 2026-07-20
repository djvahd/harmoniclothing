export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface ProductVariant {
  id: number;
  color: string;
  size: string;
  cut_type: string;
  material: string;
  price_modifier: number;
  mockup_asset_path: string | null;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  slug: string;
  base_price: number;
  category?: Category;
  variants?: ProductVariant[];
}

export type DesignStatus = "draft" | "menunggu_approval" | "published" | "ditolak";

export interface DesignApparel {
  product_id: number;
  slug: string;
  confirmed_at: string | null;
}

export interface Design {
  id: number;
  title: string;
  slug: string;
  description: string;
  thumbnail_path: string | null;
  status: DesignStatus;
  rejection_reason: string | null;
  category?: Category;
  creator: { id: number; name: string };
  products?: Product[];
  apparel?: DesignApparel[];
}

export interface CartItem {
  id: number;
  quantity: number;
  notes: string | null;
  unit_price_snapshot: number;
  subtotal: number;
  design_position: Record<string, unknown> | null;
  custom_design_file_path: string | null;
  is_available: boolean;
  product_variant: ProductVariant & { product?: Product };
  design: Design | null;
}
