export interface Category {
  id: number;
  name: string;
  slug: string;
}

export type GenderSegment = "pria" | "wanita" | "unisex" | "anak";

export type PrintArea = "depan" | "belakang" | "lengan";

export interface ProductVariant {
  id: number;
  color: string;
  size: string;
  cut_type: string;
  print_areas: PrintArea[] | null;
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
  compare_price?: number | string | null;
  discount_percent?: number | null;
  gender_segment: GenderSegment | null;
  sold_count?: number;
  rating_average?: number | null;
  review_count?: number;
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
  creator: { id: number; name: string; slug: string | null };
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
