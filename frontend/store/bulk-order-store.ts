import { create } from "zustand";

/** One selected variant + its quantity within a Bulk Order draft (Flow 7). */
export interface BulkOrderDraftItem {
  productVariantId: number;
  color: string;
  size: string;
  quantity: number;
}

export interface BulkOrderDraft {
  productSlug: string;
  productName: string;
  items: BulkOrderDraftItem[];
  designId: number | null;
  designTitle: string | null;
  customDesignFilePath: string | null;
  notes: string;
}

interface BulkOrderState {
  draft: BulkOrderDraft | null;
  setDraft: (draft: BulkOrderDraft) => void;
  clearDraft: () => void;
}

/**
 * Carries a Bulk Order draft from /bulk-order/{slug} to /checkout/bulk —
 * checkoutBulk() bypasses the cart (BR-026), so there's no server-side
 * resource to read it back from between those two pages.
 */
export const useBulkOrderStore = create<BulkOrderState>((set) => ({
  draft: null,
  setDraft: (draft) => set({ draft }),
  clearDraft: () => set({ draft: null }),
}));
