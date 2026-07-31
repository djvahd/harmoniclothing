import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import LegalPageLayout from "@/components/layout/LegalPageLayout";

export async function generateMetadata(): Promise<Metadata> {
  const tMeta = await getTranslations("public.legal.meta.privacyPolicy");
  return { title: tMeta("title"), description: tMeta("description") };
}

export default async function KebijakanPrivasiPage() {
  const t = await getTranslations("public.legal.privacyPolicy");
  return (
    <LegalPageLayout
      title={t("title")}
      updatedAt={t("updatedAt")}
      sections={[
        {
          id: "data-yang-dikumpulkan",
          title: t("sections.dataCollected.title"),
          body: (
            <>
              <p>{t("sections.dataCollected.p1")}</p>
              <p>{t("sections.dataCollected.p2")}</p>
            </>
          ),
        },
        {
          id: "penggunaan-data",
          title: t("sections.dataUsage.title"),
          body: <p>{t("sections.dataUsage.body")}</p>,
        },
        {
          id: "berbagi-data",
          title: t("sections.dataSharing.title"),
          body: <p>{t("sections.dataSharing.body")}</p>,
        },
        {
          id: "keamanan-data",
          title: t("sections.dataSecurity.title"),
          body: <p>{t("sections.dataSecurity.body")}</p>,
        },
        {
          id: "hak-pengguna",
          title: t("sections.userRights.title"),
          body: <p>{t("sections.userRights.body")}</p>,
        },
        {
          id: "perubahan-kebijakan",
          title: t("sections.policyChanges.title"),
          body: <p>{t("sections.policyChanges.body")}</p>,
        },
      ]}
    />
  );
}
