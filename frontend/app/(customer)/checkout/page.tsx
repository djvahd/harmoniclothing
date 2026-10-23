"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import { ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import OptionRow from "@/components/ui/OptionRow";
import PriceSummaryRow from "@/components/ui/PriceSummaryRow";
import Button from "@/components/ui/Button";
import { getAddresses } from "@/services/account";
import { checkout, getShippingRates } from "@/services/checkout";
import { payWithSnap } from "@/lib/snap";
import { getErrorMessage } from "@/lib/api";
import { useCart } from "@/hooks/useCart";

function CheckoutPageContent() {
  const t = useTranslations("customer.checkout");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items: allItems } = useCart();
  const { data: addressData } = useSWR("/account/addresses", getAddresses);

  // /cart lets the customer pick a subset to buy; ?items carries that
  // selection here. No param (e.g. a direct link) checks out the whole cart.
  const selectedParam = searchParams.get("items");
  const items = useMemo(() => {
    if (!selectedParam) return allItems;
    const selectedIds = new Set(selectedParam.split(",").map(Number));
    return allItems.filter((item) => selectedIds.has(item.id));
  }, [allItems, selectedParam]);

  const addresses = addressData?.data ?? [];
  const subtotal = items.reduce((sum, item) => sum + Number(item.subtotal), 0);

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

  const cartItemIds = items.map((i) => i.id);
  const ratesKey = addressId && cartItemIds.length > 0 ? ["/checkout/shipping-rates", addressId, ...cartItemIds] : null;
  const { data: ratesData, isLoading: ratesLoading } = useSWR(ratesKey, () =>
    getShippingRates({ address_id: addressId!, cart_item_ids: cartItemIds }),
  );
  const rates = ratesData?.data ?? [];

  // Re-select automatically when the address (and so the rate list) changes, so a stale
  // courier from a previous address is never silently kept.
  useEffect(() => {
    setCourier(null);
  }, [addressId]);

  const shippingCost = courier
    ? (rates.find((r) => r.courier_company === courier.company && r.courier_type === courier.type)?.price ?? 0)
    : 0;

  async function handleSubmit() {
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
      const { data: order } = await checkout({
        address_id: addressId,
        cart_item_ids: cartItemIds,
        courier_company: courier.company,
        courier_type: courier.type,
      });
      if (order.midtrans_redirect_url) {
        await payWithSnap(order.midtrans_redirect_url, () => router.push(`/account/orders/${order.id}`));
      } else {
        router.push(`/account/orders/${order.id}`);
      }
    } catch (err) {
      setError(getErrorMessage(err, tCommon("errorGeneric")));
    } finally {
      setLoading(false);
    }
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
                onSelect={() => setAddressId(address.id)}
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
              <p className="font-body text-sm text-text-secondary">{t("noRatesAvailable")}</p>
            )}
            {rates.map((rate) => (
              <OptionRow
                key={`${rate.courier_company}-${rate.courier_type}`}
                selected={courier?.company === rate.courier_company && courier?.type === rate.courier_type}
                onSelect={() => setCourier({ company: rate.courier_company, type: rate.courier_type })}
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
          {items.map((item) => (
            <div key={item.id} className="flex flex-col gap-1 font-body text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">
                  {item.product_variant.product?.name} x{item.quantity}
                </span>
                <span className="font-semibold text-text-primary">
                  {new Intl.NumberFormat("id-ID").format(item.subtotal)}
                </span>
              </div>
              {item.notes && (
                <p className="font-body text-xs italic text-text-secondary">
                  {t("notesPrefix")} {item.notes}
                </p>
              )}
            </div>
          ))}
          <div className="border-t border-border pt-3">
            <PriceSummaryRow label={t("subtotal")} amount={subtotal} />
            <PriceSummaryRow label={t("shippingCost")} amount={shippingCost} />
          </div>
          <PriceSummaryRow label={t("total")} amount={subtotal + shippingCost} emphasis />
          {error && <p className="font-body text-xs text-danger">{error}</p>}
          <Button fullWidth loading={loading} onClick={handleSubmit}>
            {t("createOrder")}
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

export default function CheckoutPage() {
  return <CheckoutPageContent />;
}
