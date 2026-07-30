"use client";

import { Award, ShieldCheck, Zap } from "lucide-react";
import { useTranslations } from "next-intl";

export default function TrustBadges() {
  const t = useTranslations("product.trustBadges");
  return (
    <div className="flex flex-wrap gap-5 border-t border-border pt-4">
      <div className="flex items-center gap-2 font-body text-xs text-text-secondary">
        <Zap className="size-4 text-primary" />
        {t("fastProduction")}
      </div>
      <div className="flex items-center gap-2 font-body text-xs text-text-secondary">
        <Award className="size-4 text-primary" />
        {t("premiumQuality")}
      </div>
      <div className="flex items-center gap-2 font-body text-xs text-text-secondary">
        <ShieldCheck className="size-4 text-primary" />
        {t("satisfactionGuarantee")}
      </div>
    </div>
  );
}
