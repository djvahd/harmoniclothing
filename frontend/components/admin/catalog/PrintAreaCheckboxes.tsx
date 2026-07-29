import type { PrintArea } from "@/types/product";

export const PRINT_AREA_OPTIONS: PrintArea[] = ["depan", "belakang", "lengan"];
export const PRINT_AREA_LABELS: Record<PrintArea, string> = {
  depan: "Depan",
  belakang: "Belakang",
  lengan: "Lengan",
};

export function togglePrintArea(list: PrintArea[], area: PrintArea): PrintArea[] {
  return list.includes(area) ? list.filter((a) => a !== area) : [...list, area];
}

/** Checkbox group for a variant's print areas, shared by the edit row and the add-variant form. */
export default function PrintAreaCheckboxes({
  value,
  onChange,
}: {
  value: PrintArea[];
  onChange: (value: PrintArea[]) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {PRINT_AREA_OPTIONS.map((area) => (
        <label key={area} className="flex cursor-pointer items-center gap-1.5">
          <input
            type="checkbox"
            checked={value.includes(area)}
            onChange={() => onChange(togglePrintArea(value, area))}
            className="size-4 rounded border-border accent-primary"
          />
          <span className="font-body text-sm text-text-secondary">{PRINT_AREA_LABELS[area]}</span>
        </label>
      ))}
    </div>
  );
}
