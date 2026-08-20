"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import clsx from "clsx";
import { locales, LOCALE_COOKIE, type Locale } from "@/i18n/config";

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
  const [isPending, setIsPending] = useState(false);

  function handleChange(next: Locale) {
    if (next === locale || isPending) return;
    setIsPending(true);
    // Set the cookie directly on the client rather than via a Server Action:
    // a Server Action that mutates cookies triggers Next.js to refresh the
    // current route's Server Components as soon as it resolves, which flips
    // the page to the new language *before* the reload below runs — visible
    // as a flash of new-language text followed by the reload's own loading
    // state. Setting the cookie here avoids that extra refresh entirely, so
    // the reload's loading state is the only transition the user sees.
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}`;
    // Client components fetch data with SWR, which isn't tied to the
    // locale cookie — a hard reload is the simplest way to refetch
    // everything (Server Components and SWR alike) in the new language.
    window.location.reload();
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
                  : "text-text-on-accent/80 hover:text-accent"
                : l === locale
                  ? "bg-primary text-text-on-accent"
                  : "text-text-secondary hover:text-accent",
            )}
          >
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}
