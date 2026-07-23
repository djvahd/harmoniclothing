"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import Button from "./Button";
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
    <label className="flex cursor-pointer items-center gap-3 py-1.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="size-4 shrink-0 rounded border-border accent-primary"
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
    <div className="border-b border-border py-4">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between font-heading text-sm font-semibold text-text-primary"
      >
        {title}
        {isOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
      </button>
      {isOpen && <div className="mt-3 flex flex-col">{children}</div>}
    </div>
  );
}

export default function FilterSidebar({
  options,
  value,
  onApply,
}: {
  options?: CatalogFilterOptions;
  value: FilterSidebarValue;
  onApply: (value: FilterSidebarValue) => void;
}) {
  const [draft, setDraft] = useState<FilterSidebarValue>(value);
  const [openSections, setOpenSections] = useState({
    kategori: true,
    segmen: true,
    warna: true,
    printArea: false,
    ukuran: true,
    harga: true,
  });

  const toggleSection = (key: keyof typeof openSections) =>
    setOpenSections((s) => ({ ...s, [key]: !s[key] }));

  const activeCount =
    draft.categories.length +
    draft.genders.length +
    draft.sizes.length +
    draft.colors.length +
    draft.printAreas.length +
    (draft.priceMin ? 1 : 0) +
    (draft.priceMax ? 1 : 0);

  return (
    <aside className="flex w-[260px] shrink-0 flex-col">
      <h2 className="border-b border-border pb-4 font-heading text-h4 font-semibold text-text-primary">
        Filter
      </h2>

      <div className="flex flex-col">
        {!!options?.categories.length && (
          <Section title="Kategori" isOpen={openSections.kategori} onToggle={() => toggleSection("kategori")}>
            {options.categories.map((c) => (
              <CheckboxRow
                key={c.slug}
                label={c.name}
                checked={draft.categories.includes(c.slug)}
                onChange={() => setDraft((d) => ({ ...d, categories: toggle(d.categories, c.slug) }))}
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
                checked={draft.genders.includes(g)}
                onChange={() => setDraft((d) => ({ ...d, genders: toggle(d.genders, g) }))}
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
                checked={draft.colors.includes(c)}
                onChange={() => setDraft((d) => ({ ...d, colors: toggle(d.colors, c) }))}
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
                checked={draft.printAreas.includes(p)}
                onChange={() => setDraft((d) => ({ ...d, printAreas: toggle(d.printAreas, p) }))}
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
                checked={draft.sizes.includes(s)}
                onChange={() => setDraft((d) => ({ ...d, sizes: toggle(d.sizes, s) }))}
              />
            ))}
          </Section>
        )}

        <Section title="Harga" isOpen={openSections.harga} onToggle={() => toggleSection("harga")}>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 rounded-sm border border-border bg-surface px-3 py-2.5">
              <span className="font-body text-sm font-medium text-text-secondary">Rp</span>
              <input
                type="number"
                min={0}
                placeholder="Harga Minimum"
                value={draft.priceMin}
                onChange={(e) => setDraft((d) => ({ ...d, priceMin: e.target.value }))}
                className="w-full bg-transparent font-body text-sm text-text-primary outline-none placeholder:text-text-secondary"
              />
            </div>
            <div className="flex items-center gap-2 rounded-sm border border-border bg-surface px-3 py-2.5">
              <span className="font-body text-sm font-medium text-text-secondary">Rp</span>
              <input
                type="number"
                min={0}
                placeholder="Harga Maksimum"
                value={draft.priceMax}
                onChange={(e) => setDraft((d) => ({ ...d, priceMax: e.target.value }))}
                className="w-full bg-transparent font-body text-sm text-text-primary outline-none placeholder:text-text-secondary"
              />
            </div>
          </div>
        </Section>
      </div>

      <div className="sticky bottom-0 flex items-center gap-3 border-t border-border bg-surface pt-4">
        <button
          onClick={() => setDraft(EMPTY_FILTER_VALUE)}
          className="font-body text-sm text-text-secondary underline"
        >
          Reset
        </button>
        <Button variant="primary" fullWidth onClick={() => onApply(draft)}>
          Terapkan{activeCount > 0 ? ` (${activeCount})` : ""}
        </Button>
      </div>
    </aside>
  );
}
