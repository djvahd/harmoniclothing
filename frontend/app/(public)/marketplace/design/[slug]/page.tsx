import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { fetchPublic } from "@/lib/server-fetch";
import type { Design } from "@/types/product";
import DesignDetailClient from "./DesignDetailClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await fetchPublic<{ data: Design }>(`/marketplace/designs/${slug}`);
  const design = result?.data;

  if (!design) {
    const t = await getTranslations("public.designDetail.meta");
    return { title: t("notFoundTitle") };
  }

  return {
    title: design.title,
    description: design.description?.slice(0, 160),
  };
}

export default function DesignDetailPage() {
  return <DesignDetailClient />;
}
