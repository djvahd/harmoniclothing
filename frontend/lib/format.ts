/**
 * Laravel's `decimal:2` casts serialize as JSON strings (e.g. "312000.00"),
 * not numbers - every monetary API field (base_price, price_modifier,
 * subtotal, unit_price_snapshot, total, etc.) arrives this way despite the
 * frontend types declaring `number`. Always coerce before formatting or
 * doing arithmetic, or string concatenation silently corrupts the value.
 */
export function formatCurrency(amount: number | string): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

// Dates come from the API in UTC; shop-facing times are shown in WIB. The locale follows the
// NEXT_LOCALE cookie (these helpers only run on the client, after data has loaded).
const TIME_ZONE = "Asia/Jakarta";

function dateLocale(): string {
  const en = typeof document !== "undefined" && /(?:^|;\s*)NEXT_LOCALE=en/.test(document.cookie);
  return en ? "en-US" : "id-ID";
}

/** Tiered "sold" figure for product cards ("10+", "100+", "1rb+") so small numbers read as momentum, not as a count to scrutinise. */
export function formatSoldCount(count: number): string {
  if (count < 10) return String(count);
  const tier = [100000, 50000, 10000, 5000, 1000, 500, 100, 50, 10].find((t) => count >= t) ?? 10;
  if (tier < 1000) return `${tier}+`;
  return `${tier / 1000}${dateLocale() === "en-US" ? "k" : "rb"}+`;
}

export function formatDate(date: string | number | Date): string {
  return new Date(date).toLocaleDateString(dateLocale(), {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: TIME_ZONE,
  });
}

export function formatDateTime(date: string | number | Date): string {
  return new Date(date).toLocaleString(dateLocale(), {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TIME_ZONE,
  });
}
