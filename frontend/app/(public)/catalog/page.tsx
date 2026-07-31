import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import CatalogListClient from "./CatalogListClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("public.catalogList.meta");
  return { title: t("title"), description: t("description") };
}

export default function CatalogPage() {
  return <CatalogListClient />;
}
