"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { locales, LOCALE_COOKIE, type Locale } from "@/i18n/config";

export async function setUserLocale(locale: Locale) {
  if (!locales.includes(locale)) return;

  const store = await cookies();
  store.set(LOCALE_COOKIE, locale, { path: "/", maxAge: 60 * 60 * 24 * 365 });

  // Re-runs the root layout's Server Components (I18nProvider, <html lang>)
  // with the freshly-set cookie so the switch takes effect immediately.
  revalidatePath("/", "layout");
}
