"use client";

import Link from "next/link";
import clsx from "clsx";

export const NAV_LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/catalog", label: "Produk" },
  { href: "/marketplace", label: "Desain" },
  { href: "/about", label: "Tentang Kami" },
];

/** Primary nav links, shared by the desktop header bar and the mobile drawer. */
export default function HeaderNav({
  variant,
  pathname,
  onNavigate,
}: {
  variant: "desktop" | "mobile";
  pathname: string;
  onNavigate?: () => void;
}) {
  if (variant === "mobile") {
    return (
      <nav className="flex flex-col gap-4 font-body text-sm text-text-primary">
        {NAV_LINKS.map((link) => (
          <Link key={link.href} href={link.href} onClick={onNavigate}>
            {link.label}
          </Link>
        ))}
      </nav>
    );
  }

  return (
    <nav className="hidden items-center gap-6 font-body text-sm md:flex md:justify-self-center">
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
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
