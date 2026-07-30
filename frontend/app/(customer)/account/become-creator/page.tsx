"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Award, Palette, Wallet } from "lucide-react";
import { useTranslations } from "next-intl";
import AccountSidebar from "@/components/layout/AccountSidebar";
import SidebarPageShell from "@/components/layout/SidebarPageShell";
import FeatureCard from "@/components/ui/FeatureCard";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { becomeCreator } from "@/services/creator";
import { getErrorMessage } from "@/lib/api";

export default function AjukanUpgradeCreatorPage() {
  const t = useTranslations("customer.becomeCreator");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [brandName, setBrandName] = useState("");
  const [bio, setBio] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await becomeCreator({
        terms_accepted: termsAccepted,
        brand_name: brandName || undefined,
        bio: bio || undefined,
        portfolio_url: portfolioUrl || undefined,
      });
      router.push("/creator/verification");
    } catch (err) {
      setError(getErrorMessage(err, tCommon("errorGeneric")));
    } finally {
      setLoading(false);
    }
  }

  return (
    <SidebarPageShell sidebar={<AccountSidebar />}>
      <div className="flex max-w-2xl flex-col gap-6">
        <h1 className="font-heading text-h3 font-semibold text-text-primary">{t("title")}</h1>
        <p className="font-body text-sm text-text-secondary">{t("subtitle")}</p>

        <div className="flex flex-wrap gap-4">
          <FeatureCard icon={Palette} title={t("benefits.upload.title")} description={t("benefits.upload.description")} />
          <FeatureCard icon={Award} title={t("benefits.featured.title")} description={t("benefits.featured.description")} />
          <FeatureCard icon={Wallet} title={t("benefits.commission.title")} description={t("benefits.commission.description")} />
        </div>

        <form onSubmit={handleApply} className="flex flex-col gap-4 rounded-md border border-border bg-surface p-5">
          <Input
            label={t("fields.brandName")}
            placeholder={t("fields.brandNamePlaceholder")}
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
          />
          <div className="flex flex-col gap-1.5">
            <label className="font-body text-xs font-medium text-text-secondary">{t("fields.bio")}</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder={t("fields.bioPlaceholder")}
              className="w-full rounded-sm border border-border bg-surface px-3 py-2.5 font-body text-sm text-text-primary outline-none"
            />
          </div>
          <Input
            label={t("fields.portfolioUrl")}
            placeholder="https://instagram.com/namamu"
            type="url"
            value={portfolioUrl}
            onChange={(e) => setPortfolioUrl(e.target.value)}
          />

          <label className="flex items-start gap-2 font-body text-xs text-text-secondary">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-0.5"
              required
            />
            {t("termsCheckbox")}
          </label>

          {error && <p className="font-body text-xs text-danger">{error}</p>}
          <Button type="submit" loading={loading}>
            {t("submit")}
          </Button>
        </form>
        <p className="font-body text-xs text-text-secondary">{t("footerNote")}</p>
      </div>
    </SidebarPageShell>
  );
}
