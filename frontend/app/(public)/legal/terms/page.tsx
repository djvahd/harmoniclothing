import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import LegalPageLayout from "@/components/layout/LegalPageLayout";

export async function generateMetadata(): Promise<Metadata> {
  const tMeta = await getTranslations("public.legal.meta.terms");
  return { title: tMeta("title"), description: tMeta("description") };
}

export default async function SyaratKetentuanPage() {
  const t = await getTranslations("public.legal.terms");
  return (
    <LegalPageLayout
      title={t("title")}
      updatedAt={t("updatedAt")}
      sections={[
        {
          id: "definisi",
          title: t("sections.definitions.title"),
          body: <p>{t("sections.definitions.body")}</p>,
        },
        {
          id: "akun-pengguna",
          title: t("sections.userAccount.title"),
          body: <p>{t("sections.userAccount.body")}</p>,
        },
        {
          id: "pemesanan-pembayaran",
          title: t("sections.ordersPayment.title"),
          body: <p>{t("sections.ordersPayment.body")}</p>,
        },
        {
          id: "hak-kreator",
          title: t("sections.creatorRights.title"),
          body: <p>{t("sections.creatorRights.body")}</p>,
        },
        {
          id: "pembatalan-pengembalian",
          title: t("sections.cancellationRefund.title"),
          body: <p>{t("sections.cancellationRefund.body")}</p>,
        },
        {
          id: "batasan-tanggung-jawab",
          title: t("sections.liability.title"),
          body: <p>{t("sections.liability.body")}</p>,
        },
        {
          id: "perubahan-ketentuan",
          title: t("sections.termsChanges.title"),
          body: <p>{t("sections.termsChanges.body")}</p>,
        },
      ]}
    />
  );
}
