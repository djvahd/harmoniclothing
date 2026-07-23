"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { CatalogFilterOptions } from "@/services/catalog";
import type { GenderSegment, PrintArea } from "@/types/product";

export interface FilterSidebarValue {
  categories: string[];
  genders: GenderSegment[];
  sizes: string[];
  colors: string[];
  printAreas: PrintArea[];
  priceMin: string;
  priceMax: string;
}

const GENDER_LABELS: Record<GenderSegment, string> = {
  pria: "Men's",
  wanita: "Women's",
  unisex: "Unisex",
  anak: "Kids",
};

const PRINT_AREA_LABELS: Record<PrintArea, string> = {
  depan: "Depan",
  belakang: "Belakang",
  lengan: "Lengan",
};

export const EMPTY_FILTER_VALUE: FilterSidebarValue = {
  categories: [],
  genders: [],
  sizes: [],
  colors: [],
  printAreas: [],
  priceMin: "",
  priceMax: "",
};

function toggle<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((i) => i !== item) : [...list, item];
}

function CheckboxRow({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 py-1">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="size-3.5 shrink-0 rounded border-border accent-primary"
      />
      <span className="font-body text-sm text-text-secondary">{label}</span>
    </label>
  );
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
        className="flex w-full items-center justify-between font-heading text-sm font-semibold text-text-primary"
      >
        {title}
        {isOpen ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
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
    kategori: true,
    segmen: true,
    warna: true,
    printArea: false,
    ukuran: true,
    harga: true,
  });
  const [priceDraft, setPriceDraft] = useState({ min: value.priceMin, max: value.priceMax });

  useEffect(() => {
    setPriceDraft({ min: value.priceMin, max: value.priceMax });
  }, [value.priceMin, value.priceMax]);

  const toggleSection = (key: keyof typeof openSections) =>
    setOpenSections((s) => ({ ...s, [key]: !s[key] }));

  const activeCount =
    value.categories.length +
    value.genders.length +
    value.sizes.length +
    value.colors.length +
    value.printAreas.length +
    (value.priceMin ? 1 : 0) +
    (value.priceMax ? 1 : 0);

  const applyPrice = () => {
    if (priceDraft.min !== value.priceMin || priceDraft.max !== value.priceMax) {
      onChange({ ...value, priceMin: priceDraft.min, priceMax: priceDraft.max });
    }
  };

  return (
    <aside className="flex w-[220px] shrink-0 flex-col">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h2 className="font-heading text-sm font-semibold text-text-primary">
          Filter{activeCount > 0 ? ` (${activeCount})` : ""}
        </h2>
        {activeCount > 0 && (
          <button
            onClick={() => onChange(EMPTY_FILTER_VALUE)}
            className="font-body text-sm text-text-secondary underline"
          >
            Reset
          </button>
        )}
      </div>

      <div className="flex flex-col">
        {!!options?.categories.length && (
          <Section title="Kategori" isOpen={openSections.kategori} onToggle={() => toggleSection("kategori")}>
            {options.categories.map((c) => (
              <CheckboxRow
                key={c.slug}
                label={c.name}
                checked={value.categories.includes(c.slug)}
                onChange={() => onChange({ ...value, categories: toggle(value.categories, c.slug) })}
              />
            ))}
          </Section>
        )}

        {!!options?.genders.length && (
          <Section title="Segmen" isOpen={openSections.segmen} onToggle={() => toggleSection("segmen")}>
            {options.genders.map((g) => (
              <CheckboxRow
                key={g}
                label={GENDER_LABELS[g]}
                checked={value.genders.includes(g)}
                onChange={() => onChange({ ...value, genders: toggle(value.genders, g) })}
              />
            ))}
          </Section>
        )}

        {!!options?.colors.length && (
          <Section title="Warna" isOpen={openSections.warna} onToggle={() => toggleSection("warna")}>
            {options.colors.map((c) => (
              <CheckboxRow
                key={c}
                label={c}
                checked={value.colors.includes(c)}
                onChange={() => onChange({ ...value, colors: toggle(value.colors, c) })}
              />
            ))}
          </Section>
        )}

        {!!options?.print_areas.length && (
          <Section title="Print Area" isOpen={openSections.printArea} onToggle={() => toggleSection("printArea")}>
            {options.print_areas.map((p) => (
              <CheckboxRow
                key={p}
                label={PRINT_AREA_LABELS[p]}
                checked={value.printAreas.includes(p)}
                onChange={() => onChange({ ...value, printAreas: toggle(value.printAreas, p) })}
              />
            ))}
          </Section>
        )}

        {!!options?.sizes.length && (
          <Section title="Ukuran" isOpen={openSections.ukuran} onToggle={() => toggleSection("ukuran")}>
            {options.sizes.map((s) => (
              <CheckboxRow
                key={s}
                label={s}
                checked={value.sizes.includes(s)}
                onChange={() => onChange({ ...value, sizes: toggle(value.sizes, s) })}
              />
            ))}
          </Section>
        )}

        <Section title="Harga" isOpen={openSections.harga} onToggle={() => toggleSection("harga")}>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5 rounded-sm border border-border bg-surface px-2 py-2">
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
            <div className="flex items-center gap-1.5 rounded-sm border border-border bg-surface px-2 py-2">
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
    </aside>
  );
}
