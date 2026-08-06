"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import type { User } from "@/types/user";

const ACCOUNT_LINKS = (isAdmin: boolean) => [
  ...(isAdmin ? [{ href: "/admin/dashboard", key: "adminDashboard" }] : []),
  { href: "/account/profile", key: "profile" },
  { href: "/account/addresses", key: "addresses" },
  { href: "/account/wishlist", key: "wishlist" },
  { href: "/account/orders", key: "orders" },
  { href: "/account/become-creator", key: "becomeCreator" },
  { href: "/notifications", key: "notifications" },
] as const;

/** The account links reused by both the desktop dropdown and the mobile drawer. */
export function AccountMenuLinks({ user, onNavigate }: { user: User | null; onNavigate: () => void }) {
  const t = useTranslations("layout.account");
  return (
    <div className="flex flex-col">
      {ACCOUNT_LINKS(user?.role === "admin").map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={onNavigate}
          className="px-5 py-2 font-body text-sm text-text-primary hover:bg-background md:px-5"
        >
          {t(link.key)}
        </Link>
      ))}
    </div>
  );
}

/** Header avatar + name trigger and its dropdown (account links + logout). */
export default function AccountMenu({
  user,
  open,
  onOpen,
  onScheduleClose,
  onCancelClose,
  onNavigate,
  onLogout,
}: {
  user: User;
  open: boolean;
  onOpen: () => void;
  onScheduleClose: () => void;
  onCancelClose: () => void;
  onNavigate: () => void;
  onLogout: () => void;
}) {
  const t = useTranslations("layout.header");
  return (
    <div className="relative" onMouseEnter={onOpen} onMouseLeave={onScheduleClose}>
      <button type="button" className="flex items-center gap-2">
        <span className="size-8 shrink-0 rounded-full bg-border" />
        <span className="whitespace-nowrap font-body text-sm font-medium text-text-primary">{user.name}</span>
      </button>
      {open && (
        <div
          onMouseEnter={onCancelClose}
          className="absolute right-0 top-full z-40 mt-2 w-64 rounded-md border border-border bg-surface py-2 shadow-lg"
        >
          <AccountMenuLinks user={user} onNavigate={onNavigate} />
          <div className="my-1 border-t border-border" />
          <button
            type="button"
            onClick={onLogout}
            className="w-full px-5 py-2 text-left font-body text-sm text-text-primary hover:bg-background"
          >
            {t("logout")}
          </button>
        </div>
      )}
    </div>
  );
}
