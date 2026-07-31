import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import MarketplaceListClient from "./MarketplaceListClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("public.marketplaceList.meta");
  return { title: t("title"), description: t("description") };
}

export default function MarketplacePage() {
  return <MarketplaceListClient />;
}
