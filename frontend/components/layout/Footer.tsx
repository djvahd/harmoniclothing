import { getTranslations } from "next-intl/server";
import Logo from "./Logo";
import LanguageSwitcher from "./LanguageSwitcher";

const FOOTER_COLUMNS = [
  {
    titleKey: "productsTitle",
    links: [
      { href: "/catalog?kategori=t-shirt", key: "tshirt" },
      { href: "/catalog?kategori=hoodie", key: "hoodie" },
      { href: "/catalog?kategori=jacket", key: "jacket" },
    ],
  },
  {
    titleKey: "helpTitle",
    links: [
      { href: "/faq", key: "faq" },
      { href: "/pusat-bantuan", key: "helpCenter" },
      { href: "/kontak", key: "contact" },
    ],
  },
  {
    titleKey: "legalTitle",
    links: [
      { href: "/legal/terms", key: "terms" },
      { href: "/legal/privacy-policy", key: "privacy" },
      { href: "/legal/returns", key: "returns" },
      { href: "/legal/shipping", key: "shipping" },
    ],
  },
] as const;

export default async function Footer() {
  const t = await getTranslations("layout.footer");
  return (
    <footer className="flex w-full flex-col gap-6 bg-primary px-4 py-6 md:px-20">
      <div className="flex flex-col gap-10 md:flex-row md:gap-16">
        <div className="flex flex-col gap-1.5">
          <Logo variant="white" />
          <p className="w-[200px] font-body text-xs text-text-on-accent">{t("tagline")}</p>
        </div>
        {FOOTER_COLUMNS.map((column) => (
          <div key={column.titleKey} className="flex flex-col gap-2">
            <p className="font-body text-xs font-bold text-text-on-accent">{t(column.titleKey)}</p>
            {column.links.map((link) => (
              <a key={link.href} href={link.href} className="font-body text-xs text-text-on-accent">
                {t(link.key)}
              </a>
            ))}
          </div>
        ))}
      </div>
      <div className="h-px w-full bg-text-on-accent/40" />
      <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
        <p className="font-body text-caption text-text-on-accent">{t("copyright")}</p>
        <LanguageSwitcher variant="dark" />
      </div>
    </footer>
  );
}
