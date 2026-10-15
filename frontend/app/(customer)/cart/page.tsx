"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { useTranslations } from "next-intl";
import CartItemRow from "@/components/ui/CartItemRow";
import Button from "@/components/ui/Button";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import { removeCartItem, updateCartItem } from "@/services/cart";
import { addToWishlist } from "@/services/wishlist";
import { useCart, invalidateCart } from "@/hooks/useCart";
import { invalidateWishlist } from "@/hooks/useWishlist";
import { formatCurrency } from "@/lib/format";
import { getErrorMessage } from "@/lib/api";
import { toast } from "@/store/toast-store";
import type { CartItem } from "@/types/product";

export default function KeranjangPage() {
  const t = useTranslations("customer.cart");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const { items, isLoading } = useCart();
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // New items default to selected (matches common cart UX); items removed
  // elsewhere (another tab, checkout) drop out of the selection automatically.
  // Bails out when the recomputed set has the same members as prev — `items`
  // isn't guaranteed referentially stable across every SWR revalidation, and
  // unconditionally returning a new Set object here re-triggers this effect
  // every render (Set instances are never Object.is-equal), which pegged the
  // cart page into "Maximum update depth exceeded".
  useEffect(() => {
    setSelectedIds((prev) => {
      const validIds = new Set(items.map((item) => item.id));
      const next = new Set(Array.from(prev).filter((id) => validIds.has(id)));
      items.forEach((item) => {
        if (!prev.has(item.id)) next.add(item.id);
      });
      if (next.size === prev.size && Array.from(next).every((id) => prev.has(id))) {
        return prev;
      }
      return next;
    });
  }, [items]);

  const groups = useMemo(() => {
    const map = new Map<string, { key: string; label: string; items: CartItem[] }>();
    items.forEach((item) => {
      const key = item.design ? `creator-${item.design.creator.id}` : "harmoni";
      const label = item.design?.creator.name ?? t("defaultStoreName");
      if (!map.has(key)) map.set(key, { key, label, items: [] });
      map.get(key)!.items.push(item);
    });
    return Array.from(map.values());
  }, [items, t]);

  const selectedTotal = items
    .filter((item) => selectedIds.has(item.id))
    .reduce((sum, item) => sum + Number(item.subtotal), 0);
  const allSelected = items.length > 0 && selectedIds.size === items.length;

  function toggleAll() {
    setSelectedIds(allSelected ? new Set() : new Set(items.map((item) => item.id)));
  }

  function toggleGroup(groupItems: CartItem[]) {
    const groupIds = groupItems.map((item) => item.id);
    const allGroupSelected = groupIds.every((id) => selectedIds.has(id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      groupIds.forEach((id) => (allGroupSelected ? next.delete(id) : next.add(id)));
      return next;
    });
  }

  function toggleItem(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleQuantityChange(id: number, quantity: number) {
    await updateCartItem(id, quantity);
    invalidateCart();
  }

  async function handleRemove(id: number) {
    await removeCartItem(id);
    invalidateCart();
  }

  async function handleMoveToWishlist(id: number) {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    try {
      await addToWishlist({
        product_id: item.design ? undefined : item.product_variant.product?.id,
        design_id: item.design?.id,
      });
      await removeCartItem(id);
      await Promise.all([invalidateCart(), invalidateWishlist()]);
      toast(t("movedToWishlist"), "success");
    } catch (err) {
      toast(getErrorMessage(err, tCommon("errorGeneric")), "danger");
    }
  }

  function handleBuy() {
    router.push(`/checkout?items=${Array.from(selectedIds).join(",")}`);
  }

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 py-8 md:px-20">
      <h1 className="font-heading text-h3 font-semibold text-text-primary">{t("title")}</h1>

      {isLoading && <LoadingState rows={3} />}

      {!isLoading && items.length === 0 && (
        <EmptyState
          icon={ShoppingCart}
          title={t("empty")}
          action={
            <Button href="/catalog">{t("startShopping")}</Button>
          }
        />
      )}

      {items.length > 0 && (
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          <div className="flex flex-1 flex-col gap-4">
            <label className="flex items-center gap-3 rounded-md border border-border bg-surface p-4 font-body text-sm font-medium text-text-primary">
              <input type="checkbox" checked={allSelected} onChange={toggleAll} className="size-4" />
              {t("selectAll", { count: items.length })}
            </label>

            {groups.map((group) => {
              const groupSelected = group.items.every((item) => selectedIds.has(item.id));
              return (
                <div
                  key={group.key}
                  className="flex flex-col gap-3 rounded-md border border-border bg-surface p-4"
                >
                  <label className="flex items-center gap-2.5 font-body text-sm font-medium text-text-primary">
                    <input
                      type="checkbox"
                      checked={groupSelected}
                      onChange={() => toggleGroup(group.items)}
                      className="size-4"
                    />
                    <span className="size-1.5 rounded-full bg-primary" />
                    {group.label}
                  </label>
                  <div className="flex flex-col gap-4 border-t border-border pt-3">
                    {group.items.map((item) => (
                      <div key={item.id}>
                        <CartItemRow
                          item={item}
                          selected={selectedIds.has(item.id)}
                          onToggleSelected={toggleItem}
                          onQuantityChange={handleQuantityChange}
                          onRemove={handleRemove}
                          onMoveToWishlist={handleMoveToWishlist}
                        />
                        {!item.is_available && (
                          <p className="mt-2 pl-7 font-body text-xs text-danger">
                            {t("itemUnavailable")}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex w-full flex-col gap-4 rounded-md border border-border bg-surface p-5 md:sticky md:top-8 md:w-[320px]">
            <p className="font-heading text-lg font-semibold text-text-primary">{t("orderSummary")}</p>
            <div className="flex items-center justify-between border-t border-border pt-3 font-body text-sm">
              <span className="text-text-secondary">{t("total")}</span>
              <span className="font-heading text-base font-semibold text-text-primary">
                {selectedIds.size > 0 ? formatCurrency(selectedTotal) : "-"}
              </span>
            </div>
            <Button fullWidth disabled={selectedIds.size === 0} onClick={handleBuy}>
              {t("buy")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
