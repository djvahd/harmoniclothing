import type { Metadata } from "next";
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
    return { title: "Produk Tidak Ditemukan" };
  }

  return {
    title: product.name,
    description: product.description?.slice(0, 160),
  };
}

export default function ProductDetailPage() {
  return <ProductDetailClient />;
}
