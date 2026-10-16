import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import LegalPageLayout from "@/components/layout/LegalPageLayout";
import { CONTACT } from "@/lib/contact";

export async function generateMetadata(): Promise<Metadata> {
  const tMeta = await getTranslations("public.info.meta.contact");
  return { title: tMeta("title"), description: tMeta("description") };
}

export default async function ContactPage() {
  const t = await getTranslations("public.info");
  const locale = await getLocale();
  const comingSoon = t("comingSoon");
  const link = "text-accent hover:underline";

  return (
    <LegalPageLayout
      title={t("contact.title")}
      updatedAt={t("updatedAt")}
      sections={[
        {
          id: "whatsapp",
          title: t("contact.sections.whatsapp"),
          body: CONTACT.whatsapp ? (
            <p>
              <a className={link} href={`https://wa.me/${CONTACT.whatsapp}`} target="_blank" rel="noopener noreferrer">
                {`+${CONTACT.whatsapp}`}
              </a>
              {` — ${t("contact.intro")}`}
            </p>
          ) : (
            <p>{comingSoon}</p>
          ),
        },
        {
          id: "email",
          title: t("contact.sections.email"),
          body: CONTACT.email ? (
            <p>
              <a className={link} href={`mailto:${CONTACT.email}`}>
                {CONTACT.email}
              </a>
            </p>
          ) : (
            <p>{comingSoon}</p>
          ),
        },
        {
          id: "alamat",
          title: t("contact.sections.address"),
          body: <p>{CONTACT.address || comingSoon}</p>,
        },
        {
          id: "jam-operasional",
          title: t("contact.sections.hours"),
          body: <p>{CONTACT.hours[locale === "en" ? "en" : "id"] || comingSoon}</p>,
        },
      ]}
    />
  );
}
