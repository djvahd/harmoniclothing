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

export function formatDate(date: string | number | Date): string {
  return new Date(date).toLocaleDateString("id-ID");
}

export function formatDateTime(date: string | number | Date): string {
  return new Date(date).toLocaleString("id-ID");
}
