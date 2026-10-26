"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { useTranslations } from "next-intl";
import CreatorSidebar from "@/components/layout/CreatorSidebar";
import SidebarPageShell from "@/components/layout/SidebarPageShell";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import InlineError from "@/components/ui/InlineError";
import LoadingState from "@/components/ui/LoadingState";
import { getCreatorProfile, updateCreatorProfile } from "@/services/creator";
import { getErrorMessage } from "@/lib/api";

const PAYOUT_METHOD_KEYS = {
  bank_transfer: "bankTransfer",
  gopay: "gopay",
  ovo: "ovo",
  dana: "dana",
  shopeepay: "shopeepay",
} as const;

export default function ProfilKreatorPage() {
  const t = useTranslations("creator.profile");
  const tVerification = useTranslations("creator.verification");
  const tCommon = useTranslations("common");
  const { data, error: loadError, mutate } = useSWR("/creator/profile", getCreatorProfile);
  const profile = data?.data;
  const [brandName, setBrandName] = useState("");
  const [bio, setBio] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setBrandName(profile.brand_name ?? "");
    setBio(profile.bio ?? "");
    setPortfolioUrl(profile.portfolio_url ?? "");
  }, [profile]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);
    try {
      const res = await updateCreatorProfile({
        brand_name: brandName.trim() || null,
        bio: bio.trim() || null,
        portfolio_url: portfolioUrl.trim() || null,
      });
      await mutate(res, { revalidate: false });
      setSaved(true);
    } catch (err) {
      setError(getErrorMessage(err, tCommon("errorGeneric")));
    } finally {
      setLoading(false);
    }
  }

  return (
    <SidebarPageShell sidebar={<CreatorSidebar />}>
      <div className="flex max-w-lg flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-heading text-h3 font-semibold text-text-primary">{t("title")}</h1>
          <p className="font-body text-sm text-text-secondary">{t("subtitle")}</p>
        </div>
        {loadError && !data && <InlineError />}
        {!data && !loadError && <LoadingState rows={3} />}
        {profile && (
          <>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-md border border-border bg-surface p-5">
              <Input label={t("fields.brandName")} value={brandName} maxLength={150} onChange={(e) => setBrandName(e.target.value)} />
              <div className="flex flex-col gap-1.5">
                <label htmlFor="creator-profile-bio" className="font-body text-xs font-medium text-text-secondary">
                  {t("fields.bio")}
                </label>
                <textarea
                  id="creator-profile-bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  maxLength={500}
                  className="w-full rounded-sm border border-border bg-surface px-3 py-2.5 font-body text-sm text-text-primary outline-none transition-colors hover:border-primary focus:border-primary"
                />
              </div>
              <Input
                label={t("fields.portfolioUrl")}
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
              />
              {error && <p className="font-body text-xs text-danger">{error}</p>}
              {saved && <p className="font-body text-xs text-success">{t("saved")}</p>}
              <Button type="submit" loading={loading}>
                {t("save")}
              </Button>
              <Link href={`/marketplace/${profile.slug}`} className="font-body text-xs font-medium text-primary underline">
                {t("viewPublic")}
              </Link>
            </form>

            <div className="flex flex-col gap-2 rounded-md border border-border bg-surface p-5">
              <p className="font-body text-sm font-semibold text-text-primary">{t("payout.title")}</p>
              {profile.payout_account_masked ? (
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 font-body text-sm text-text-primary">
                  <dt className="text-text-secondary">{t("payout.method")}</dt>
                  <dd>{profile.payout_method ? tVerification(`payoutMethods.${PAYOUT_METHOD_KEYS[profile.payout_method]}`) : "-"}</dd>
                  <dt className="text-text-secondary">{t("payout.account")}</dt>
                  <dd>{profile.payout_account_masked}</dd>
                  <dt className="text-text-secondary">{t("payout.holder")}</dt>
                  <dd>{profile.payout_account_holder ?? "-"}</dd>
                </dl>
              ) : (
                <p className="font-body text-sm text-text-secondary">{t("payout.empty")}</p>
              )}
              <p className="font-body text-xs text-text-secondary">{t("payout.note")}</p>
            </div>
          </>
        )}
      </div>
    </SidebarPageShell>
  );
}
