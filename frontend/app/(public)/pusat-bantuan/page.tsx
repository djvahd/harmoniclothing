import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import LegalPageLayout from "@/components/layout/LegalPageLayout";

export async function generateMetadata(): Promise<Metadata> {
  const tMeta = await getTranslations("public.info.meta.helpCenter");
  return { title: tMeta("title"), description: tMeta("description") };
}

const TOPICS = [
  { key: "faq", href: "/faq" },
  { key: "returns", href: "/legal/returns" },
  { key: "shipping", href: "/legal/shipping" },
  { key: "contact", href: "/kontak" },
] as const;

export default async function HelpCenterPage() {
  const t = await getTranslations("public.info");
  return (
    <LegalPageLayout
      title={t("helpCenter.title")}
      updatedAt={t("updatedAt")}
      sections={TOPICS.map((topic) => ({
        id: topic.key,
        title: t(`helpCenter.sections.${topic.key}.title`),
        body: (
          <p>
            {`${t(`helpCenter.sections.${topic.key}.body`)} `}
            <Link href={topic.href} className="text-accent hover:underline">
              {t("helpCenter.open")}
            </Link>
          </p>
        ),
      }))}
    />
  );
}
