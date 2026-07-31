import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { fetchPublic } from "@/lib/server-fetch";
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

export default function ProductDetailPage() {
  return <ProductDetailClient />;
}
