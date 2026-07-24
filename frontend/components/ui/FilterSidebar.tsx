"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, LayoutGrid, Shirt } from "lucide-react";
import clsx from "clsx";
import type { CatalogFilterOptions } from "@/services/catalog";
import type { GenderSegment } from "@/types/product";

export interface FilterSidebarValue {
  categories: string[];
  genders: GenderSegment[];
  sizes: string[];
  colors: string[];
  materials: string[];
  priceMin: string;
  priceMax: string;
}

const GENDER_LABELS: Record<GenderSegment, string> = {
  pria: "Men's",
  wanita: "Women's",
  unisex: "Unisex",
  anak: "Kids",
};

const GENDER_ORDER: GenderSegment[] = ["pria", "wanita", "unisex", "anak"];

/** Variant color is free text (admin-entered), so this only covers common
 * Indonesian names — anything else falls through as a raw CSS color value
 * (works for hex codes / English names, degrades gracefully otherwise). */
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

function swatchColor(name: string): string {
  return COLOR_SWATCH_MAP[name.trim().toLowerCase()] ?? name;
}

export const EMPTY_FILTER_VALUE: FilterSidebarValue = {
  categories: [],
  genders: [],
  sizes: [],
  colors: [],
  materials: [],
  priceMin: "",
  priceMax: "",
};

function toggle<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((i) => i !== item) : [...list, item];
}

function Section({
  title,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-border py-3">
      <button
        onClick={onToggle}
        className="group flex w-full items-center justify-between rounded-sm font-heading text-sm font-semibold text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
      >
        {title}
        <span className="rounded-full p-1 transition-colors group-hover:bg-border/50">
          {isOpen ? (
            <ChevronUp className="size-3.5 text-text-secondary" />
          ) : (
            <ChevronDown className="size-3.5 text-text-secondary" />
          )}
        </span>
      </button>
      {isOpen && <div className="mt-2 flex flex-col">{children}</div>}
    </div>
  );
}

export default function FilterSidebar({
  options,
  value,
  onChange,
}: {
  options?: CatalogFilterOptions;
  value: FilterSidebarValue;
  onChange: (value: FilterSidebarValue) => void;
}) {
  const [openSections, setOpenSections] = useState({
    segmen: true,
    warna: true,
    ukuran: true,
    material: true,
    harga: true,
  });
  const [priceDraft, setPriceDraft] = useState({ min: value.priceMin, max: value.priceMax });

  useEffect(() => {
    setPriceDraft({ min: value.priceMin, max: value.priceMax });
  }, [value.priceMin, value.priceMax]);

  const toggleSection = (key: keyof typeof openSections) =>
    setOpenSections((s) => ({ ...s, [key]: !s[key] }));

  const activeCount =
    value.genders.length +
    value.sizes.length +
    value.colors.length +
    value.materials.length +
    (value.priceMin ? 1 : 0) +
    (value.priceMax ? 1 : 0);

  const applyPrice = () => {
    if (priceDraft.min !== value.priceMin || priceDraft.max !== value.priceMax) {
      onChange({ ...value, priceMin: priceDraft.min, priceMax: priceDraft.max });
    }
  };

  // Skeleton for the whole panel (Kategori + Filter) so it doesn't sit
  // empty — and so nothing shows partially (e.g. just Harga) while the
  // rest of the facets are still loading.
  if (!options) {
    return (
      <aside className="flex w-[220px] shrink-0 animate-pulse flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="h-3 w-16 rounded-sm bg-border" />
          <div className="flex flex-col gap-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 w-full rounded-md bg-border" />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4 border-t border-border pt-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="h-3.5 w-14 rounded-sm bg-border" />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="h-7 w-14 rounded-sm bg-border" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>
    );
  }

  return (
    <aside className="flex w-[220px] shrink-0 flex-col gap-6">
      {!!options?.categories.length && (
        <div className="flex flex-col">
          <p className="mb-2 font-heading text-sm font-semibold text-text-primary">Kategori</p>
          <div className="flex flex-col gap-0.5">
            <button
              onClick={() => onChange({ ...value, categories: [] })}
              className={clsx(
                "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-left font-body text-sm transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
                value.categories.length === 0
                  ? "bg-accent text-text-on-accent"
                  : "text-text-secondary hover:translate-x-0.5 hover:bg-border/50 hover:text-text-primary",
              )}
            >
              <LayoutGrid className="size-4 shrink-0" />
              Semua
            </button>
            {options.categories.map((c) => (
              <button
                key={c.slug}
                onClick={() => onChange({ ...value, categories: [c.slug] })}
                className={clsx(
                  "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-left font-body text-sm transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
                  value.categories.includes(c.slug)
                    ? "bg-accent text-text-on-accent"
                    : "text-text-secondary hover:translate-x-0.5 hover:bg-border/50 hover:text-text-primary",
                )}
              >
                <Shirt className="size-4 shrink-0" />
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="font-heading text-sm font-semibold text-text-primary">
            Filter{activeCount > 0 ? ` (${activeCount})` : ""}
          </h2>
          {activeCount > 0 && (
            <button
              onClick={() => onChange({ ...EMPTY_FILTER_VALUE, categories: value.categories })}
              className="rounded-sm font-body text-sm text-text-secondary underline transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
            >
              Reset
            </button>
          )}
        </div>

        <div className="flex flex-col">
          {!!options?.genders.length && (
            <Section title="Segmen" isOpen={openSections.segmen} onToggle={() => toggleSection("segmen")}>
              <div className="flex flex-wrap gap-2">
                {GENDER_ORDER.filter((g) => options.genders.includes(g)).map((g) => (
                  <button
                    key={g}
                    onClick={() => onChange({ ...value, genders: toggle(value.genders, g) })}
                    className={clsx(
                      "rounded-sm border px-3 py-1.5 text-center font-body text-sm transition-colors active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
                      value.genders.includes(g)
                        ? "border-accent bg-accent text-text-on-accent"
                        : "border-border text-text-secondary hover:border-primary hover:bg-border/40 hover:text-text-primary",
                    )}
                  >
                    {GENDER_LABELS[g]}
                  </button>
                ))}
              </div>
            </Section>
          )}

          {!!options?.colors.length && (
            <Section title="Warna" isOpen={openSections.warna} onToggle={() => toggleSection("warna")}>
              <div className="flex flex-wrap gap-2">
                {options.colors.map((c) => (
                  <button
                    key={c}
                    title={c}
                    onClick={() => onChange({ ...value, colors: toggle(value.colors, c) })}
                    className={clsx(
                      "size-7 shrink-0 rounded-full border-2 transition-all hover:scale-110 active:scale-[0.9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2",
                      value.colors.includes(c)
                        ? "border-accent ring-2 ring-accent/30"
                        : "border-border hover:border-primary",
                    )}
                    style={{ backgroundColor: swatchColor(c) }}
                  />
                ))}
              </div>
            </Section>
          )}

          {!!options?.sizes.length && (
            <Section title="Ukuran" isOpen={openSections.ukuran} onToggle={() => toggleSection("ukuran")}>
              <div className="flex flex-wrap gap-2">
                {options.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => onChange({ ...value, sizes: toggle(value.sizes, s) })}
                    className={clsx(
                      "min-w-[40px] rounded-sm border px-2.5 py-1.5 text-center font-body text-sm transition-colors active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
                      value.sizes.includes(s)
                        ? "border-accent bg-accent text-text-on-accent"
                        : "border-border text-text-secondary hover:border-primary hover:bg-border/40 hover:text-text-primary",
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </Section>
          )}

          {!!options?.materials.length && (
            <Section title="Material" isOpen={openSections.material} onToggle={() => toggleSection("material")}>
              <div className="flex flex-wrap gap-2">
                {options.materials.map((m) => (
                  <button
                    key={m}
                    onClick={() => onChange({ ...value, materials: toggle(value.materials, m) })}
                    className={clsx(
                      "rounded-sm border px-3 py-1.5 text-center font-body text-sm transition-colors active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
                      value.materials.includes(m)
                        ? "border-accent bg-accent text-text-on-accent"
                        : "border-border text-text-secondary hover:border-primary hover:bg-border/40 hover:text-text-primary",
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </Section>
          )}

          <Section title="Harga" isOpen={openSections.harga} onToggle={() => toggleSection("harga")}>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5 rounded-sm border border-border bg-surface px-2 py-2 transition-colors hover:border-primary hover:bg-border/40 focus-within:border-primary focus-within:bg-surface">
                <span className="font-body text-sm font-medium text-text-secondary">Rp</span>
                <input
                  type="number"
                  min={0}
                  placeholder="Minimum"
                  value={priceDraft.min}
                  onChange={(e) => setPriceDraft((d) => ({ ...d, min: e.target.value }))}
                  onBlur={applyPrice}
                  onKeyDown={(e) => e.key === "Enter" && applyPrice()}
                  className="w-full min-w-0 bg-transparent font-body text-sm text-text-primary outline-none placeholder:text-text-secondary"
                />
              </div>
              <div className="flex items-center gap-1.5 rounded-sm border border-border bg-surface px-2 py-2 transition-colors hover:border-primary hover:bg-border/40 focus-within:border-primary focus-within:bg-surface">
                <span className="font-body text-sm font-medium text-text-secondary">Rp</span>
                <input
                  type="number"
                  min={0}
                  placeholder="Maksimum"
                  value={priceDraft.max}
                  onChange={(e) => setPriceDraft((d) => ({ ...d, max: e.target.value }))}
                  onBlur={applyPrice}
                  onKeyDown={(e) => e.key === "Enter" && applyPrice()}
                  className="w-full min-w-0 bg-transparent font-body text-sm text-text-primary outline-none placeholder:text-text-secondary"
                />
              </div>
            </div>
          </Section>
        </div>
      </div>
    </aside>
  );
}
