"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import PrintAreaCheckboxes from "./PrintAreaCheckboxes";
import { updateVariant } from "@/services/admin";
import { formatCurrency } from "@/lib/format";
import { getErrorMessage } from "@/lib/api";
import type { ProductVariant } from "@/types/product";

/** A single variant table row with inline edit (price modifier + print areas). */
export default function VariantRow({
  variant,
  onSaved,
}: {
  variant: ProductVariant;
  onSaved: () => void;
}) {
  const tCommon = useTranslations("common");
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    price_modifier: String(variant.price_modifier),
    print_areas: variant.print_areas ?? [],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await updateVariant(variant.id, {
        color: variant.color,
        size: variant.size,
        cut_type: variant.cut_type,
        material: variant.material,
        mockup_asset_path: variant.mockup_asset_path ?? "",
        price_modifier: Number(editForm.price_modifier),
        print_areas: editForm.print_areas,
      });
      onSaved();
      setEditing(false);
    } catch (err) {
      setError(getErrorMessage(err, tCommon("errorGeneric")));
    } finally {
      setSaving(false);
    }
  }

  return (
    <tr className="border-b border-border last:border-0">
      <td className="p-3 text-text-secondary">{variant.color}</td>
      <td className="p-3 text-text-secondary">{variant.size}</td>
      <td className="p-3 text-text-secondary">{variant.cut_type}</td>
      <td className="p-3 text-text-secondary">{variant.material}</td>
      <td className="p-3">
        {editing ? (
          <PrintAreaCheckboxes
            value={editForm.print_areas}
            onChange={(print_areas) => setEditForm((f) => ({ ...f, print_areas }))}
          />
        ) : (
          <span className="text-text-secondary">
            {variant.print_areas?.map((a) => tCommon(`printAreas.${a}`)).join(", ") || "-"}
          </span>
        )}
      </td>
      <td className="p-3">
        {editing ? (
          <input
            type="number"
            value={editForm.price_modifier}
            onChange={(e) => setEditForm((f) => ({ ...f, price_modifier: e.target.value }))}
            className="w-24 rounded-sm border border-border bg-surface px-2 py-1 font-body text-sm text-text-primary outline-none"
          />
        ) : (
          <span className="text-text-secondary">{formatCurrency(variant.price_modifier)}</span>
        )}
      </td>
      <td className="p-3">
        {editing ? (
          <div className="flex items-center gap-2">
            <Button onClick={handleSave} loading={saving}>
              {tCommon("save")}
            </Button>
            <button
              onClick={() => setEditing(false)}
              className="font-body text-xs text-text-secondary underline"
            >
              {tCommon("cancel")}
            </button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="text-text-secondary hover:text-primary">
            <Pencil className="size-4" />
          </button>
        )}
        {error && <p className="mt-1 font-body text-xs text-danger">{error}</p>}
      </td>
    </tr>
  );
}
