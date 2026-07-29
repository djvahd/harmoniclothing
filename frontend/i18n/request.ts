import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { defaultLocale, locales, LOCALE_COOKIE, type Locale } from "./config";

export default getRequestConfig(async () => {
  const store = await cookies();
  const cookieValue = store.get(LOCALE_COOKIE)?.value;
  const locale: Locale = locales.includes(cookieValue as Locale)
    ? (cookieValue as Locale)
    : defaultLocale;

  return {
    locale,
    messages: (await import(`../locales/${locale}.json`)).default,
  };
});
