"use client";

import clsx from "clsx";
import { Ruler } from "lucide-react";
import { useTranslations } from "next-intl";
import Tag from "@/components/ui/Tag";
import SizeChartTable from "@/components/product/SizeChartTable";
import { swatchColor } from "@/lib/colors";

export default function VariantPicker({
  colors,
  activeColor,
  onSelectColor,
  sizes,
  activeSize,
  onSelectSize,
  showSizeChart,
  onToggleSizeChart,
}: {
  colors: string[];
  activeColor: string | null;
  onSelectColor: (color: string) => void;
  sizes: string[];
  activeSize: string | null;
  onSelectSize: (size: string) => void;
  showSizeChart: boolean;
  onToggleSizeChart: () => void;
}) {
  const t = useTranslations("product.variantPicker");
  return (
    <>
      {colors.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="font-body text-sm font-medium text-text-primary">
            {t("chooseColor")}{activeColor ? `: ${activeColor}` : ""}
          </p>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => onSelectColor(c)}
                aria-label={c}
                aria-pressed={activeColor === c}
                className={clsx(
                  "size-8 rounded-full border-2 transition-colors",
                  activeColor === c ? "border-accent" : "border-border hover:border-primary/50",
                )}
                style={{ backgroundColor: swatchColor(c) }}
              />
            ))}
          </div>
        </div>
      )}

      {sizes.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="font-body text-sm font-medium text-text-primary">{t("chooseSize")}</p>
            <button
              type="button"
              onClick={onToggleSizeChart}
              className="flex items-center gap-1 font-body text-xs text-text-secondary transition-colors hover:text-primary"
            >
              <Ruler className="size-3.5" />
              {t("sizeChart")}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => (
              <button key={s} type="button" onClick={() => onSelectSize(s)} aria-pressed={activeSize === s}>
                <Tag active={activeSize === s} size="sm">
                  {s}
                </Tag>
              </button>
            ))}
          </div>
          {showSizeChart && <SizeChartTable />}
        </div>
      )}
    </>
  );
}
