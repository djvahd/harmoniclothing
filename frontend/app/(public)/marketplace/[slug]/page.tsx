import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { fetchPublic, isMissing } from "@/lib/server-fetch";
import type { CreatorProfile } from "@/services/marketplace";
import CreatorProfileClient from "./CreatorProfileClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await fetchPublic<{ data: CreatorProfile }>(`/marketplace/creators/${slug}`);
  const creator = result?.data;
  const t = await getTranslations("public.creatorProfile.meta");

  if (!creator) {
    return { title: t("notFoundTitle") };
  }

  return {
    title: creator.name,
    description: creator.bio?.slice(0, 160) ?? t("descriptionFallback", { name: creator.name }),
  };
}

export default async function CreatorProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (await isMissing(`/marketplace/creators/${slug}`)) notFound();
  return <CreatorProfileClient />;
}
