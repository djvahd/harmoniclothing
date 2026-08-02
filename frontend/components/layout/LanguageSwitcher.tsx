"use client";

import { useTransition } from "react";
import { useLocale } from "next-intl";
import clsx from "clsx";
import { setUserLocale } from "@/lib/locale-actions";
import { locales, type Locale } from "@/i18n/config";

export default function LanguageSwitcher({
  className,
  variant = "light",
}: {
  className?: string;
  /** "dark" is for placement on a solid `bg-primary` surface (e.g. the footer), where the
   * default colors — tuned for a light background — would wash out. */
  variant?: "light" | "dark";
}) {
  const locale = useLocale();
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
      <div
        className={clsx(
          "flex items-center rounded-full border p-0.5",
          variant === "dark" ? "border-text-on-accent/40" : "border-border",
        )}
      >
        {locales.map((l) => (
          <button
            key={l}
            type="button"
            disabled={isPending}
            aria-pressed={l === locale}
            onClick={() => handleChange(l)}
            className={clsx(
              "rounded-full px-2 py-0.5 font-body text-xs font-medium uppercase transition-colors",
              variant === "dark"
                ? l === locale
                  ? "bg-surface text-primary"
                  : "text-text-on-accent/80 hover:text-text-on-accent"
                : l === locale
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
