"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import { ShieldCheck, ShoppingCart } from "lucide-react";
import { useTranslations } from "next-intl";
import OptionRow from "@/components/ui/OptionRow";
import PriceSummaryRow from "@/components/ui/PriceSummaryRow";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import LoadingState from "@/components/ui/LoadingState";
import { getAddresses } from "@/services/account";
import { checkout, getPaymentMethods, getShippingRates } from "@/services/checkout";
import { payWithSnap } from "@/lib/snap";
import { getErrorMessage } from "@/lib/api";
import { useCart } from "@/hooks/useCart";

function CheckoutPageContent() {
  const t = useTranslations("customer.checkout");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items: allItems, isLoading: cartLoading } = useCart();
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
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [orderNotes, setOrderNotes] = useState("");
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

  // Like the courier, the first method is preselected until the customer picks one. If the list
  // fails to load nothing is sent and Snap offers every channel, so checkout never blocks on it.
  const { data: methodsData } = useSWR("/checkout/payment-methods", getPaymentMethods);
  const paymentMethods = methodsData?.data ?? [];
  const selectedPayment = paymentMethod ?? paymentMethods[0]?.code;
  const paymentGroups = [...new Set(paymentMethods.map((m) => m.group))];

  // Re-select automatically when the address (and so the rate list) changes, so a stale
  // courier from a previous address is never silently kept.
  useEffect(() => {
    setCourier(null);
  }, [addressId]);

  // Until the customer picks one, the cheapest rate is selected so the total never shows without shipping.
  const cheapestRate = rates.length > 0 ? rates.reduce((min, r) => (r.price < min.price ? r : min)) : null;
  const selectedCourier =
    courier ?? (cheapestRate ? { company: cheapestRate.courier_company, type: cheapestRate.courier_type } : null);

  const shippingCost = selectedCourier
    ? (rates.find((r) => r.courier_company === selectedCourier.company && r.courier_type === selectedCourier.type)
        ?.price ?? 0)
    : 0;

  async function handleSubmit() {
    if (items.length === 0) return;
    if (!addressId) {
      setError(t("selectAddressError"));
      return;
    }
    if (!selectedCourier) {
      setError(t("selectCourierError"));
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const { data: order } = await checkout({
        address_id: addressId,
        cart_item_ids: cartItemIds,
        courier_company: selectedCourier.company,
        courier_type: selectedCourier.type,
        payment_method: selectedPayment,
        notes: orderNotes.trim() || undefined,
      });
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

  if (cartLoading) return <LoadingState />;

  if (items.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-[1440px] flex-col px-4 py-8 md:px-20">
        <EmptyState
          icon={ShoppingCart}
          title={t("emptyCart")}
          action={<Button href="/cart">{t("backToCart")}</Button>}
        />
      </div>
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
                selected={
                  selectedCourier?.company === rate.courier_company && selectedCourier?.type === rate.courier_type
                }
                onSelect={() => {
                  setCourier({ company: rate.courier_company, type: rate.courier_type });
                  setError(null);
                }}
                label={rate.courier_service_name.replace(/^(\S+) \1\b/i, "$1")}
                sublabel={rate.duration?.replace(/\bdays?\b/i, "hari")}
                price={new Intl.NumberFormat("id-ID").format(rate.price)}
              />
            ))}
          </section>

          {paymentMethods.length > 0 && (
            <section className="flex flex-col gap-3 rounded-md border border-border bg-surface p-5">
              <div>
                <p className="font-heading text-lg font-semibold text-text-primary">{t("paymentMethod")}</p>
                <p className="font-body text-xs text-text-secondary">{t("paymentMethodHint")}</p>
              </div>
              {paymentGroups.map((group) => (
                <div key={group} className="flex flex-col gap-2">
                  <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-secondary">
                    {t(`paymentGroup.${group}`)}
                  </p>
                  {paymentMethods
                    .filter((m) => m.group === group)
                    .map((method) => (
                      <OptionRow
                        key={method.code}
                        selected={selectedPayment === method.code}
                        onSelect={() => setPaymentMethod(method.code)}
                        label={method.label}
                      />
                    ))}
                </div>
              ))}
            </section>
          )}

          <section className="flex flex-col gap-3 rounded-md border border-border bg-surface p-5">
            <label htmlFor="order-notes" className="font-heading text-lg font-semibold text-text-primary">
              {t("orderNotes")}
            </label>
            <textarea
              id="order-notes"
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder={t("orderNotesPlaceholder")}
              rows={3}
              maxLength={500}
              className="w-full rounded-sm border border-border bg-surface px-3 py-2.5 font-body text-sm text-text-primary outline-none transition-colors hover:border-primary focus:border-primary"
            />
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
            {selectedCourier ? (
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
          <Button fullWidth loading={loading} disabled={items.length === 0} onClick={handleSubmit}>
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
