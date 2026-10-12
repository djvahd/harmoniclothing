import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import LegalPageLayout from "@/components/layout/LegalPageLayout";

export async function generateMetadata(): Promise<Metadata> {
  const tMeta = await getTranslations("public.info.meta.shipping");
  return { title: tMeta("title"), description: tMeta("description") };
}

export default async function ShippingPolicyPage() {
  const t = await getTranslations("public.info");
  const sections = t.raw("shipping.sections") as { title: string; body: string }[];
  return (
    <LegalPageLayout
      title={t("shipping.title")}
      updatedAt={t("updatedAt")}
      sections={sections.map((section, index) => ({
        id: `shipping-${index + 1}`,
        title: section.title,
        body: <p>{section.body}</p>,
      }))}
    />
  );
}
