"use client";

import Link from "next/link";
import clsx from "clsx";
import { useTranslations } from "next-intl";

export const NAV_LINKS = [
  { href: "/", key: "home" },
  { href: "/catalog", key: "products" },
  { href: "/marketplace", key: "designs" },
  { href: "/about", key: "about" },
] as const;

/** Primary nav links, shared by the desktop header bar and the mobile drawer. */
export default function HeaderNav({
  variant,
  pathname,
  onNavigate,
  className,
}: {
  variant: "desktop" | "mobile";
  pathname: string;
  onNavigate?: () => void;
  className?: string;
}) {
  const t = useTranslations("layout.nav");

  if (variant === "mobile") {
    return (
      <nav className="flex flex-col gap-4 font-body text-sm text-text-primary">
        {NAV_LINKS.map((link) => (
          <Link key={link.href} href={link.href} onClick={onNavigate}>
            {t(link.key)}
          </Link>
        ))}
      </nav>
    );
  }

  return (
    <nav
      className={clsx(
        "hidden items-center gap-6 font-body text-sm lg:flex lg:justify-self-center",
        className,
      )}
    >
      {NAV_LINKS.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={clsx(
              "relative py-1 transition-colors after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:bg-primary after:transition-all after:content-['']",
              isActive
                ? "font-semibold text-primary after:w-full"
                : "text-text-primary after:w-0 hover:text-primary hover:after:w-full",
            )}
          >
            {t(link.key)}
          </Link>
        );
      })}
    </nav>
  );
}
