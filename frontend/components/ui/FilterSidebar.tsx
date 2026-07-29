"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, LayoutGrid, Tag as TagIcon } from "lucide-react";
import clsx from "clsx";
import type { GenderSegment } from "@/types/product";

export interface FilterSidebarOptions {
  categories: { slug: string; name: string }[];
  genders: GenderSegment[];
  sizes: string[];
  colors: string[];
  materials: string[];
  /** Design-only facet — omitted (or empty) on Katalog Produk, so this section simply doesn't render there. */
  popular_tags?: { slug: string; name: string }[];
  price_min: number;
  price_max: number;
}

export interface FilterSidebarValue {
  categories: string[];
  genders: GenderSegment[];
  sizes: string[];
  colors: string[];
  materials: string[];
  tags: string[];
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

/** Debounce before auto-applying a typed price, mirroring the search bar's
 * live-as-you-type feel without firing a request on every keystroke. */
const PRICE_APPLY_DELAY_MS = 500;

const PRICE_STEP = { min: 50_000, max: 50_000 };

function parsePriceDigits(raw: string): string {
  return raw.replace(/\D/g, "");
}

function formatPriceDigits(digits: string): string {
  return digits ? new Intl.NumberFormat("id-ID").format(Number(digits)) : "";
}

export const EMPTY_FILTER_VALUE: FilterSidebarValue = {
  categories: [],
  genders: [],
  sizes: [],
  colors: [],
  materials: [],
  tags: [],
  priceMin: "",
  priceMax: "",
};

function toggle<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((i) => i !== item) : [...list, item];
}

export function Section({
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

/** Single-select "Semua | A | B | ..." list, shared by Kategori (design/product's own theme) and the Creator tab's category filter. */
export function CategoryList({
  label,
  icon: Icon,
  items,
  selected,
  onSelect,
}: {
  label: string;
  icon: typeof LayoutGrid;
  items: { slug: string; name: string }[];
  selected: string[];
  onSelect: (slugs: string[]) => void;
}) {
  return (
    <div className="flex flex-col">
      <p className="mb-2 font-heading text-sm font-semibold text-text-primary">{label}</p>
      <div className="flex flex-col gap-0.5">
        <button
          type="button"
          onClick={() => onSelect([])}
          className={clsx(
            "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-left font-body text-sm transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
            selected.length === 0
              ? "bg-accent text-text-on-accent"
              : "text-text-secondary hover:translate-x-0.5 hover:bg-border/50 hover:text-text-primary",
          )}
        >
          <Icon className="size-4 shrink-0" />
          Semua
        </button>
        {items.map((c) => (
          <button
            key={c.slug}
            type="button"
            onClick={() => onSelect([c.slug])}
            className={clsx(
              "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-left font-body text-sm transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
              selected.includes(c.slug)
                ? "bg-accent text-text-on-accent"
                : "text-text-secondary hover:translate-x-0.5 hover:bg-border/50 hover:text-text-primary",
            )}
          >
            <Icon className="size-4 shrink-0" />
            {c.name}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Shared catalog/marketplace filter panel (categories, tags, gender/size/color/material, price range); sections with no data for the current listing simply don't render. */
export default function FilterSidebar({
  options,
  value,
  onChange,
  skeletonFacetCount = 3,
}: {
  options?: FilterSidebarOptions;
  value: FilterSidebarValue;
  onChange: (value: FilterSidebarValue) => void;
  /** Number of facet-group placeholders in the loading skeleton — pass the real count for the page using this sidebar (Katalog Produk: 5 — Segmen/Warna/Ukuran/Material/Harga; Marketplace Desain: 2 — Tag/Harga). */
  skeletonFacetCount?: number;
}) {
  const [openSections, setOpenSections] = useState({
    segmen: true,
    warna: true,
    ukuran: true,
    material: true,
    tag: true,
    harga: true,
  });
  const [priceDraft, setPriceDraft] = useState({ min: value.priceMin, max: value.priceMax });
  const priceApplyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setPriceDraft({ min: value.priceMin, max: value.priceMax });
  }, [value.priceMin, value.priceMax]);

  useEffect(() => {
    return () => {
      if (priceApplyTimer.current) clearTimeout(priceApplyTimer.current);
    };
  }, []);

  const toggleSection = (key: keyof typeof openSections) =>
    setOpenSections((s) => ({ ...s, [key]: !s[key] }));

  const activeCount =
    value.genders.length +
    value.sizes.length +
    value.colors.length +
    value.materials.length +
    value.tags.length +
    (value.priceMin ? 1 : 0) +
    (value.priceMax ? 1 : 0);

  const applyPrice = (draft: { min: string; max: string }) => {
    if (priceApplyTimer.current) {
      clearTimeout(priceApplyTimer.current);
      priceApplyTimer.current = null;
    }
    if (draft.min !== value.priceMin || draft.max !== value.priceMax) {
      onChange({ ...value, priceMin: draft.min, priceMax: draft.max });
    }
  };

  const handlePriceInput = (field: "min" | "max", raw: string) => {
    const next = { ...priceDraft, [field]: parsePriceDigits(raw) };
    setPriceDraft(next);
    if (priceApplyTimer.current) clearTimeout(priceApplyTimer.current);
    priceApplyTimer.current = setTimeout(() => applyPrice(next), PRICE_APPLY_DELAY_MS);
  };

  const stepPrice = (field: "min" | "max", direction: 1 | -1) => {
    const current = Number(priceDraft[field] || 0);
    const stepped = Math.max(0, current + direction * PRICE_STEP[field]);
    const next = { ...priceDraft, [field]: stepped ? String(stepped) : "" };
    setPriceDraft(next);
    applyPrice(next);
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
          {Array.from({ length: skeletonFacetCount }).map((_, i) => (
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
        <CategoryList
          label="Kategori"
          icon={LayoutGrid}
          items={options.categories}
          selected={value.categories}
          onSelect={(categories) => onChange({ ...value, categories })}
        />
      )}

      <div className="flex flex-col">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="font-heading text-sm font-semibold text-text-primary">
            Filter{activeCount > 0 ? ` (${activeCount})` : ""}
          </h2>
          {activeCount > 0 && (
            <button
              onClick={() =>
                onChange({
                  ...EMPTY_FILTER_VALUE,
                  categories: value.categories,
                })
              }
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

          {!!options?.popular_tags?.length && (
            <Section title="Tag" isOpen={openSections.tag} onToggle={() => toggleSection("tag")}>
              <div className="flex flex-wrap gap-2">
                {options.popular_tags.map((t) => (
                  <button
                    key={t.slug}
                    onClick={() => onChange({ ...value, tags: toggle(value.tags, t.slug) })}
                    className={clsx(
                      "flex items-center gap-1 rounded-full border px-3 py-1.5 text-center font-body text-sm transition-colors active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
                      value.tags.includes(t.slug)
                        ? "border-accent bg-accent text-text-on-accent"
                        : "border-border text-text-secondary hover:border-primary hover:bg-border/40 hover:text-text-primary",
                    )}
                  >
                    <TagIcon className="size-3" />
                    {t.name}
                  </button>
                ))}
              </div>
            </Section>
          )}

          <Section title="Harga" isOpen={openSections.harga} onToggle={() => toggleSection("harga")}>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5 rounded-sm border border-border bg-surface py-1 pl-2 pr-1 transition-colors hover:border-primary hover:bg-border/40 focus-within:border-primary focus-within:bg-surface">
                <span className="font-body text-sm font-medium text-text-secondary">Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Minimum"
                  value={formatPriceDigits(priceDraft.min)}
                  onChange={(e) => handlePriceInput("min", e.target.value)}
                  onBlur={() => applyPrice(priceDraft)}
                  onKeyDown={(e) => e.key === "Enter" && applyPrice(priceDraft)}
                  className="w-full min-w-0 bg-transparent font-body text-sm text-text-primary outline-none placeholder:text-text-secondary"
                />
                <div className="flex shrink-0 flex-col">
                  <button
                    type="button"
                    aria-label="Naikkan harga minimum"
                    onClick={() => stepPrice("min", 1)}
                    className="rounded-t-sm px-0.5 text-text-secondary transition-colors hover:bg-border/60 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                  >
                    <ChevronUp className="size-3" />
                  </button>
                  <button
                    type="button"
                    aria-label="Turunkan harga minimum"
                    onClick={() => stepPrice("min", -1)}
                    className="rounded-b-sm px-0.5 text-text-secondary transition-colors hover:bg-border/60 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                  >
                    <ChevronDown className="size-3" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-1.5 rounded-sm border border-border bg-surface py-1 pl-2 pr-1 transition-colors hover:border-primary hover:bg-border/40 focus-within:border-primary focus-within:bg-surface">
                <span className="font-body text-sm font-medium text-text-secondary">Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Maksimum"
                  value={formatPriceDigits(priceDraft.max)}
                  onChange={(e) => handlePriceInput("max", e.target.value)}
                  onBlur={() => applyPrice(priceDraft)}
                  onKeyDown={(e) => e.key === "Enter" && applyPrice(priceDraft)}
                  className="w-full min-w-0 bg-transparent font-body text-sm text-text-primary outline-none placeholder:text-text-secondary"
                />
                <div className="flex shrink-0 flex-col">
                  <button
                    type="button"
                    aria-label="Naikkan harga maksimum"
                    onClick={() => stepPrice("max", 1)}
                    className="rounded-t-sm px-0.5 text-text-secondary transition-colors hover:bg-border/60 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                  >
                    <ChevronUp className="size-3" />
                  </button>
                  <button
                    type="button"
                    aria-label="Turunkan harga maksimum"
                    onClick={() => stepPrice("max", -1)}
                    className="rounded-b-sm px-0.5 text-text-secondary transition-colors hover:bg-border/60 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                  >
                    <ChevronDown className="size-3" />
                  </button>
                </div>
              </div>
            </div>
          </Section>
        </div>
      </div>
    </aside>
  );
}
