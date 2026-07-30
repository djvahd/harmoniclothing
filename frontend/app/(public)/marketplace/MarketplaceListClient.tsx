"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import clsx from "clsx";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import DesainTab from "@/components/marketplace/DesainTab";
import CreatorTab from "@/components/marketplace/CreatorTab";

type Tab = "desain" | "creator";

function MarketplaceDesainPageContent() {
  const t = useTranslations("public.marketplaceList");
  const searchParams = useSearchParams();
  const kategoriParam = searchParams.get("kategori");
  // Beranda's "Desain Populer" row links here with ?sort=populer — map that
  // intent onto the closest real sort option (most sold) rather than
  // leaving it silently unread.
  const populerSort = searchParams.get("sort") === "populer";
  const initialTab: Tab = searchParams.get("tab") === "creator" ? "creator" : "desain";

  const [tab, setTab] = useState<Tab>(initialTab);

  const tabs: { key: Tab; tKey: string }[] = [
    { key: "desain", tKey: "designs" },
    { key: "creator", tKey: "creators" },
  ];

  return (
    <div className="flex flex-col">
      <section
        className="flex flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between md:px-20"
        style={{
          background:
            "linear-gradient(to bottom, transparent 85%, #f8fafc 100%), linear-gradient(28deg, #f8fafc 25%, #eef6f3 64%, #e0f1ea 96%)",
        }}
      >
        <div className="flex max-w-xl flex-col gap-4">
          <h1 className="font-heading text-h3 font-semibold text-text-primary md:text-h1">
            {t("title")}
          </h1>
          <p className="font-body text-sm text-text-secondary md:text-base">{t("subtitle")}</p>
          <div className="flex gap-3">
            <Link href="/account/become-creator">
              <Button variant="primary">{t("ctaBecomeCreator")}</Button>
            </Link>
            <Link href="/catalog">
              <Button variant="secondary">{t("ctaViewProducts")}</Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-[1440px] gap-2 border-b border-border px-4 md:px-20">
        {tabs.map((tabDef) => (
          <button
            key={tabDef.key}
            onClick={() => setTab(tabDef.key)}
            className={clsx(
              "relative px-4 py-3 font-heading text-sm font-semibold transition-colors",
              tab === tabDef.key ? "text-primary" : "text-text-secondary hover:text-text-primary",
            )}
          >
            {t(`tabs.${tabDef.tKey}`)}
            {tab === tabDef.key && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary" />
            )}
          </button>
        ))}
      </div>

      {tab === "desain" ? (
        <DesainTab kategoriParam={kategoriParam} defaultSort={populerSort ? "terlaris" : "terbaru"} />
      ) : (
        <CreatorTab />
      )}
    </div>
  );
}

export default function MarketplaceDesainPage() {
  return (
    <Suspense fallback={null}>
      <MarketplaceDesainPageContent />
    </Suspense>
  );
}
