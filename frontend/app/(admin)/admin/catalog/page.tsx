"use client";

import { Fragment, useState } from "react";
import useSWR, { mutate } from "swr";
import { ChevronDown, ChevronRight, PackageSearch, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import AdminSidebar from "@/components/layout/AdminSidebar";
import SidebarPageShell from "@/components/layout/SidebarPageShell";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { TableRowsSkeleton } from "@/components/ui/LoadingState";
import ProductForm from "@/components/admin/catalog/ProductForm";
import VariantRow from "@/components/admin/catalog/VariantRow";
import VariantForm from "@/components/admin/catalog/VariantForm";
import BulkPricingTiers from "@/components/admin/catalog/BulkPricingTiers";
import Badge from "@/components/ui/Badge";
import { getAdminProducts } from "@/services/admin";
import { swrKeys } from "@/lib/swr-keys";
import { formatCurrency } from "@/lib/format";

/** Admin list comes from /admin/catalog/products (not the public one): includes inactive products and both languages. */
function refreshAdminProducts() {
  return mutate(swrKeys.adminProducts());
}

export default function KelolaKatalogPage() {
  const t = useTranslations("admin.catalog");
  const { data, isLoading } = useSWR(swrKeys.adminProducts(), () => getAdminProducts({ per_page: 100 }));
  const products = data?.data ?? [];

  const [showForm, setShowForm] = useState(false);
  const [expandedProductId, setExpandedProductId] = useState<number | null>(null);

  function toggleExpand(productId: number) {
    setExpandedProductId((current) => (current === productId ? null : productId));
  }

  return (
    <SidebarPageShell sidebar={<AdminSidebar />}>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-h3 font-semibold text-text-primary">
            {t("title")}
          </h1>
          <Button onClick={() => setShowForm((v) => !v)}>
            <Plus className="size-4" /> {t("addProduct")}
          </Button>
        </div>

        {showForm && (
          <ProductForm
            onSaved={() => {
              refreshAdminProducts();
              setShowForm(false);
            }}
          />
        )}

        <BulkPricingTiers />

        <div className="overflow-x-auto rounded-md border border-border bg-surface">
          <table className="w-full text-left font-body text-sm">
            <thead className="border-b border-border text-text-secondary">
              <tr>
                <th className="w-8 p-4" />
                <th className="p-4">{t("columns.name")}</th>
                <th className="p-4">{t("columns.category")}</th>
                <th className="p-4">{t("columns.basePrice")}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <TableRowsSkeleton columns={4} />}
              {!isLoading && products.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-0">
                    <EmptyState icon={PackageSearch} title={t("empty")} />
                  </td>
                </tr>
              )}
              {products.map((product) => (
                <Fragment key={product.id}>
                  <tr
                    onClick={() => toggleExpand(product.id)}
                    className="cursor-pointer border-b border-border last:border-0 hover:bg-border/20"
                  >
                    <td className="p-4 text-text-secondary">
                      {expandedProductId === product.id ? (
                        <ChevronDown className="size-4" />
                      ) : (
                        <ChevronRight className="size-4" />
                      )}
                    </td>
                    <td className="p-4 font-medium text-text-primary">
                      {product.name_id}
                      {!product.is_active && <Badge variant="neutral" className="ml-2">{t("inactive")}</Badge>}
                    </td>
                    <td className="p-4 text-text-secondary">{product.category?.name ?? "-"}</td>
                    <td className="p-4 text-text-secondary">{formatCurrency(product.base_price)}</td>
                  </tr>
                  {expandedProductId === product.id && (
                    <tr key={`${product.id}-variants`} className="border-b border-border bg-surface last:border-0">
                      <td colSpan={4} className="p-4">
                        <div className="flex flex-col gap-4">
                          <h3 className="font-heading text-sm font-semibold text-text-primary">{t("productDetails")}</h3>
                          <ProductForm product={product} onSaved={refreshAdminProducts} />

                          <h3 className="font-heading text-sm font-semibold text-text-primary">{t("productVariants")}</h3>

                          {!!product.variants?.length && (
                            <div className="overflow-x-auto rounded-md border border-border">
                              <table className="w-full text-left font-body text-sm">
                                <thead className="border-b border-border text-text-secondary">
                                  <tr>
                                    <th className="p-3">{t("variantColumns.color")}</th>
                                    <th className="p-3">{t("variantColumns.size")}</th>
                                    <th className="p-3">{t("variantColumns.cutType")}</th>
                                    <th className="p-3">{t("variantColumns.material")}</th>
                                    <th className="p-3">{t("variantColumns.printArea")}</th>
                                    <th className="p-3">{t("variantColumns.priceAddon")}</th>
                                    <th className="p-3">{t("variantColumns.actions")}</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {product.variants.map((variant) => (
                                    <VariantRow key={variant.id} variant={variant} onSaved={refreshAdminProducts} />
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}

                          <VariantForm productId={product.id} onCreated={refreshAdminProducts} />
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SidebarPageShell>
  );
}
