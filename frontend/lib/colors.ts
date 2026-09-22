/** Maps a product/design color's stored name to a real CSS color for swatch
 * dots — variants only ever store a plain-text name (usually Indonesian:
 * "Hitam", "Merah", ...), which the CSS `background-color` property doesn't
 * understand, so rendering the name directly leaves most swatches blank.
 * Anything not in the map falls through as a raw CSS value (works for hex
 * codes or English names already in the data, degrades gracefully otherwise). */
const COLOR_SWATCH_MAP: Record<string, string> = {
  hitam: "#111827",
  putih: "#ffffff",
  navy: "#1e2a4a",
  merah: "#dc2626",
  "abu-abu": "#9ca3af",
  abu: "#9ca3af",
  biru: "#2563eb",
  hijau: "#16a34a",
  kuning: "#eab308",
  coklat: "#78350f",
  cokelat: "#78350f",
  krem: "#f5e9d3",
  maroon: "#7f1d1d",
  oranye: "#f97316",
  ungu: "#7c3aed",
  pink: "#ec4899",
  "merah muda": "#ec4899",
  emas: "#d4af37",
  perak: "#c0c0c0",
};

export function swatchColor(name: string): string {
  return COLOR_SWATCH_MAP[name.trim().toLowerCase()] ?? name;
}
