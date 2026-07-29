import clsx from "clsx";

export interface TabDef {
  key: string;
  label: string;
  badge?: number;
}

export default function ProductTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: readonly TabDef[];
  active: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 border-b border-border">
      {tabs.map((t) => (
        <button
          key={t.key}
          type="button"
          onClick={() => onChange(t.key)}
          className={clsx(
            "relative px-4 py-3 font-heading text-sm font-semibold transition-colors",
            active === t.key ? "text-primary" : "text-text-secondary hover:text-text-primary",
          )}
        >
          {t.badge ? `${t.label} (${t.badge})` : t.label}
          {active === t.key && (
            <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary" />
          )}
        </button>
      ))}
    </div>
  );
}

export const CARE_TAB_CONTENT = (
  <p>
    Gunakan air dingin dan deterjen lembut, jangan gunakan pemutih, jemur di tempat teduh, dan
    setrika suhu rendah pada bagian dalam untuk menjaga hasil sablon tetap awet.
  </p>
);

export const SHIPPING_TAB_CONTENT = (
  <p>
    Produk umumnya diproduksi 1–3 hari kerja setelah pesanan dikonfirmasi, lalu dikirim ke seluruh
    Indonesia menggunakan kurir pilihanmu saat checkout. Estimasi tiba mengikuti layanan kurir yang
    dipilih.
  </p>
);

export function ReviewsTabContent({
  hasRating,
  ratingAverage,
  reviewCount,
  emptyMessage,
}: {
  hasRating: boolean;
  ratingAverage: number | null | undefined;
  reviewCount: number | null | undefined;
  emptyMessage: string;
}) {
  if (!hasRating) return <p>{emptyMessage}</p>;
  return (
    <p>
      Rating {ratingAverage} dari {reviewCount} ulasan pembeli. Daftar ulasan lengkap akan tampil
      di sini setelah fitur listing ulasan tersedia.
    </p>
  );
}
