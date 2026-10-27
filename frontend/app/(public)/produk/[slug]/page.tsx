import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { fetchPublic, isMissing } from "@/lib/server-fetch";
import type { Product } from "@/types/product";
import ProductDetailClient from "./ProductDetailClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await fetchPublic<{ data: Product }>(`/catalog/products/${slug}`);
  const product = result?.data;

  if (!product) {
    const t = await getTranslations("public.productDetail.meta");
    return { title: t("notFoundTitle") };
  }

  return {
    title: product.name,
    description: product.description?.slice(0, 160),
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // Real HTTP 404 for an unknown slug (it used to be a 200 page with a "not found" message).
  if (await isMissing(`/catalog/products/${slug}`)) notFound();
  return <ProductDetailClient />;
}
