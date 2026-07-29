"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import clsx from "clsx";
import { setUserLocale } from "@/lib/locale-actions";
import { locales, type Locale } from "@/i18n/config";

export default function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const t = useTranslations("common");
  const [isPending, startTransition] = useTransition();

  function handleChange(next: Locale) {
    if (next === locale || isPending) return;
    startTransition(async () => {
      await setUserLocale(next);
      // Client components fetch data with SWR, which isn't tied to the
      // locale cookie — a hard reload is the simplest way to refetch
      // everything (Server Components and SWR alike) in the new language.
      window.location.reload();
    });
  }

  return (
    <div className={clsx("flex items-center gap-1.5", className)}>
      <span className="font-body text-xs text-text-secondary">{t("language")}</span>
      <div className="flex items-center rounded-full border border-border p-0.5">
        {locales.map((l) => (
          <button
            key={l}
            type="button"
            disabled={isPending}
            aria-pressed={l === locale}
            onClick={() => handleChange(l)}
            className={clsx(
              "rounded-full px-2 py-0.5 font-body text-xs font-medium uppercase transition-colors",
              l === locale
                ? "bg-primary text-text-on-accent"
                : "text-text-secondary hover:text-text-primary",
            )}
          >
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}
