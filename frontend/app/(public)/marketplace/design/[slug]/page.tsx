import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { fetchPublic, isMissing } from "@/lib/server-fetch";
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

export default async function DesignDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (await isMissing(`/marketplace/designs/${slug}`)) notFound();
  return <DesignDetailClient />;
}
