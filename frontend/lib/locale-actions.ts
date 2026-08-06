"use server";

import { cookies } from "next/headers";
import { locales, LOCALE_COOKIE, type Locale } from "@/i18n/config";

export async function setUserLocale(locale: Locale) {
  if (!locales.includes(locale)) return;

  const store = await cookies();
  store.set(LOCALE_COOKIE, locale, { path: "/", maxAge: 60 * 60 * 24 * 365 });

  // No revalidatePath here: the caller always follows this with a hard
  // window.location.reload(), which alone picks up the new cookie. Revalidating
  // here would apply the new locale to the RSC tree mid-flight (before this
  // action's promise resolves), causing a visible flash of new-language text
  // followed by the reload's own flash — a jarring double transition.
}
