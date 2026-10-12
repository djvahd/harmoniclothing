import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import LegalPageLayout from "@/components/layout/LegalPageLayout";

export async function generateMetadata(): Promise<Metadata> {
  const tMeta = await getTranslations("public.info.meta.faq");
  return { title: tMeta("title"), description: tMeta("description") };
}

export default async function FaqPage() {
  const t = await getTranslations("public.info");
  const items = t.raw("faq.items") as { q: string; a: string }[];
  return (
    <LegalPageLayout
      title={t("faq.title")}
      updatedAt={t("updatedAt")}
      sections={items.map((item, index) => ({
        id: `faq-${index + 1}`,
        title: item.q,
        body: <p>{item.a}</p>,
      }))}
    />
  );
}
