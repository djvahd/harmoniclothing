import type { Design, Product } from "./product";
import type { Order } from "./order";

export interface WishlistItem {
  id: number;
  product: Product | null;
  design: Design | null;
  is_available: boolean;
}

export interface Invoice {
  invoice_number: string;
  issued_at: string;
  order: Order;
}
