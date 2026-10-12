import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import LegalPageLayout from "@/components/layout/LegalPageLayout";

export async function generateMetadata(): Promise<Metadata> {
  const tMeta = await getTranslations("public.info.meta.returns");
  return { title: tMeta("title"), description: tMeta("description") };
}

export default async function ReturnsPolicyPage() {
  const t = await getTranslations("public.info");
  const sections = t.raw("returns.sections") as { title: string; body: string }[];
  return (
    <LegalPageLayout
      title={t("returns.title")}
      updatedAt={t("updatedAt")}
      sections={sections.map((section, index) => ({
        id: `returns-${index + 1}`,
        title: section.title,
        body: <p>{section.body}</p>,
      }))}
    />
  );
}
