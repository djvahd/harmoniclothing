import { Download } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Order } from "@/types/order";

/**
 * Print-file preview for admin/production staff: one card per order item
 * showing which product to print and the actual design file, with a link to
 * open/download the original. Renders as an extra table row under the order.
 */
export default function OrderItemDesigns({ order, colSpan }: { order: Order; colSpan: number }) {
  const t = useTranslations("admin.orderDesign");

  return (
    <tr className="border-b border-border bg-background last:border-0">
      <td colSpan={colSpan} className="p-4">
        <ul className="flex flex-wrap gap-4">
          {order.items.map((item) => {
            const fileUrl = item.custom_design_url ?? item.design_file_url;
            const source = item.custom_design_url ? t("sourceCustom") : t("sourceMarketplace");
            const variant = item.product_variant;
            return (
              <li
                key={item.id}
                className="flex w-64 flex-col gap-2 rounded-md border border-border bg-surface p-3"
              >
                <p className="font-medium text-text-primary">
                  {`${variant?.product?.name ?? "-"} × ${item.quantity}`}
                </p>
                <p className="text-xs text-text-secondary">
                  {[variant?.color, variant?.size].filter(Boolean).join(" / ")}
                </p>
                {item.design_position && Object.keys(item.design_position).length > 0 && (
                  <p className="text-xs text-text-secondary">
                    {`${t("position")}: ${Object.entries(item.design_position)
                      .map(([key, value]) => `${key} ${String(value)}`)
                      .join(", ")}`}
                  </p>
                )}
                {fileUrl ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={fileUrl}
                      alt={t("alt")}
                      className="h-40 w-full rounded-sm bg-white object-contain"
                    />
                    <div className="flex items-center justify-between text-xs text-text-secondary">
                      <span>{source}</span>
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-medium text-accent hover:underline"
                      >
                        <Download className="h-3.5 w-3.5" />
                        {t("openFile")}
                      </a>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-text-secondary">{t("noDesign")}</p>
                )}
              </li>
            );
          })}
        </ul>
      </td>
    </tr>
  );
}
