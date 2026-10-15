"use client";

import { AlertTriangle } from "lucide-react";
import { mutate } from "swr";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";

/**
 * Shown where a data-driven section failed to load (API down, network error).
 * Without it these sections stayed on their skeleton forever or fell through
 * to a misleading "not found". Retry revalidates every SWR key on the page.
 */
export default function InlineError({ onRetry }: { onRetry?: () => void }) {
  const t = useTranslations("ui.errorState");

  return (
    <div role="alert" className="flex w-full flex-col items-center justify-center gap-3 px-4 py-16 text-center">
      <AlertTriangle className="size-10 text-danger" />
      <p className="font-heading text-h3 font-semibold text-text-primary">{t("title")}</p>
      <p className="font-body text-sm text-text-secondary">{t("description")}</p>
      <Button onClick={onRetry ?? (() => void mutate(() => true))}>{t("retry")}</Button>
    </div>
  );
}
