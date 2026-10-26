"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import OptionRow from "@/components/ui/OptionRow";
import PriceSummaryRow from "@/components/ui/PriceSummaryRow";
import Button from "@/components/ui/Button";
import DetailNotFound from "@/components/product/DetailNotFound";
import { getAddresses } from "@/services/account";
import { checkoutBulk, getShippingRates } from "@/services/checkout";
import { payWithSnap } from "@/lib/snap";
import { getErrorMessage } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { useBulkPricingTiers, findBulkTier } from "@/hooks/useBulkPricing";
import { useBulkOrderStore } from "@/store/bulk-order-store";

/** Flow 7 continuation — separate from regular /checkout (BR-026), submits a Bulk Order draft to POST /checkout/bulk. */
export default function BulkCheckoutPage() {
  const t = useTranslations("customer.checkoutBulk");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const draft = useBulkOrderStore((s) => s.draft);
  const clearDraft = useBulkOrderStore((s) => s.clearDraft);
  const { data: addressData } = useSWR("/account/addresses", getAddresses);
  const { tiers } = useBulkPricingTiers();

  const addresses = addressData?.data ?? [];
  const totalQuantity = draft?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  const tier = findBulkTier(tiers, totalQuantity);
  const unitPrice = tier?.price_per_unit ?? 0;
  const subtotal = unitPrice * totalQuantity;

  const [addressId, setAddressId] = useState<number | null>(null);
  const [courier, setCourier] = useState<{ company: string; type: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (addressId === null && addresses.length > 0) {
      setAddressId(addresses.find((a) => a.is_default)?.id ?? addresses[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addresses]);

  const bulkItems = draft?.items.map((item) => ({
    product_variant_id: item.productVariantId,
    quantity: item.quantity,
  }));
  const ratesKey = addressId && bulkItems && bulkItems.length > 0
    ? ["/checkout/shipping-rates", "bulk", addressId, ...bulkItems.map((i) => `${i.product_variant_id}:${i.quantity}`)]
    : null;
  const { data: ratesData, isLoading: ratesLoading } = useSWR(ratesKey, () =>
    getShippingRates({ address_id: addressId!, items: bulkItems }),
  );
  const rates = ratesData?.data ?? [];

  useEffect(() => {
    setCourier(null);
  }, [addressId]);

  const shippingCost = courier
    ? (rates.find((r) => r.courier_company === courier.company && r.courier_type === courier.type)?.price ?? 0)
    : 0;

  async function handleSubmit() {
    if (!draft) return;
    if (!addressId) {
      setError(t("selectAddressError"));
      return;
    }
    if (!courier) {
      setError(t("selectCourierError"));
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const { data: order } = await checkoutBulk({
        address_id: addressId,
        items: draft.items.map((item) => ({
          product_variant_id: item.productVariantId,
          quantity: item.quantity,
        })),
        courier_company: courier.company,
        courier_type: courier.type,
        design_id: draft.designId ?? undefined,
        custom_design_file_path: draft.customDesignFilePath ?? undefined,
        notes: draft.notes || undefined,
      });
      clearDraft();
      if (order.midtrans_redirect_url) {
        await payWithSnap(order.midtrans_redirect_url, () => router.push(`/account/orders/${order.id}?paying=1`));
      } else {
        router.push(`/account/orders/${order.id}`);
      }
    } catch (err) {
      setError(getErrorMessage(err, tCommon("errorGeneric")));
    } finally {
      setLoading(false);
    }
  }

  if (!draft) {
    return (
      <DetailNotFound
        message={t("noDraft")}
        backHref="/catalog"
        backLabel={t("backToCatalog")}
      />
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 py-8 md:px-20">
      <h1 className="font-heading text-h3 font-semibold text-text-primary">{t("title")}</h1>

      <div className="flex flex-col gap-6 md:flex-row">
        <div className="flex flex-1 flex-col gap-6">
          <section className="flex flex-col gap-3 rounded-md border border-border bg-surface p-5">
            <p className="font-heading text-lg font-semibold text-text-primary">
              {t("shippingAddress")}
            </p>
            {addresses.length === 0 && (
              <p className="font-body text-sm text-text-secondary">{t("noSavedAddress")}</p>
            )}
            {addresses.map((address) => (
              <OptionRow
                key={address.id}
                selected={addressId === address.id}
                onSelect={() => {
                  setAddressId(address.id);
                  setError(null);
                }}
                label={`${address.label} - ${address.recipient_name}`}
                sublabel={`${address.address_line}, ${address.district}, ${address.city}, ${address.province} ${address.postal_code}`}
              />
            ))}
          </section>

          <section className="flex flex-col gap-3 rounded-md border border-border bg-surface p-5">
            <p className="font-heading text-lg font-semibold text-text-primary">
              {t("shippingCourier")}
            </p>
            {!addressId && (
              <p className="font-body text-sm text-text-secondary">{t("selectAddressFirst")}</p>
            )}
            {addressId && ratesLoading && (
              <p className="font-body text-sm text-text-secondary">{t("loadingRates")}</p>
            )}
            {addressId && !ratesLoading && rates.length === 0 && (
              <p className="font-body text-sm text-text-secondary">
                {t("noRatesAvailable")}{" "}
                <Link href="/account/addresses" className="font-medium text-primary hover:underline">
                  {t("changeAddress")}
                </Link>
              </p>
            )}
            {rates.map((rate) => (
              <OptionRow
                key={`${rate.courier_company}-${rate.courier_type}`}
                selected={courier?.company === rate.courier_company && courier?.type === rate.courier_type}
                onSelect={() => {
                  setCourier({ company: rate.courier_company, type: rate.courier_type });
                  setError(null);
                }}
                label={rate.courier_service_name}
                sublabel={rate.duration ?? undefined}
                price={new Intl.NumberFormat("id-ID").format(rate.price)}
              />
            ))}
          </section>
        </div>

        <div className="flex w-full flex-col gap-4 rounded-md border border-border bg-surface p-5 md:w-[320px]">
          <p className="font-heading text-lg font-semibold text-text-primary">
            {t("orderSummary")}
          </p>
          <p className="font-body text-sm font-medium text-text-primary">{draft.productName}</p>
          {draft.designTitle && (
            <p className="font-body text-xs text-text-secondary">
              {t("designPrefix")} {draft.designTitle}
            </p>
          )}
          {draft.items.map((item) => (
            <div
              key={item.productVariantId}
              className="flex justify-between font-body text-sm text-text-secondary"
            >
              <span>
                {item.color} / {item.size} x{item.quantity}
              </span>
              <span className="font-semibold text-text-primary">
                {formatCurrency(unitPrice * item.quantity)}
              </span>
            </div>
          ))}
          {draft.notes && (
            <p className="font-body text-xs italic text-text-secondary">
              {t("notesPrefix")} {draft.notes}
            </p>
          )}
          <div className="border-t border-border pt-3">
            <PriceSummaryRow label={t("pricePerUnit", { qty: totalQuantity })} amount={unitPrice} />
            <PriceSummaryRow label={t("subtotal")} amount={subtotal} />
            {courier ? (
              <PriceSummaryRow label={t("shippingCost")} amount={shippingCost} />
            ) : (
              <div className="flex items-center justify-between font-body text-sm">
                <p className="text-text-secondary">{t("shippingCost")}</p>
                <p className="text-text-secondary">{t("shippingPending")}</p>
              </div>
            )}
          </div>
          <PriceSummaryRow label={t("total")} amount={subtotal + shippingCost} emphasis />
          {error && <p className="font-body text-xs text-danger">{error}</p>}
          <Button fullWidth loading={loading} onClick={handleSubmit}>
            {t("createBulkOrder")}
          </Button>
          <p className="flex items-center gap-1.5 font-body text-xs text-text-secondary">
            <ShieldCheck className="size-3.5 text-primary" />
            {t("securePayment")}
          </p>
        </div>
      </div>
    </div>
  );
}
