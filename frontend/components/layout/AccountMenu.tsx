"use client";

import Link from "next/link";
import type { User } from "@/types/user";

const ACCOUNT_LINKS = (isAdmin: boolean) => [
  ...(isAdmin ? [{ href: "/admin/dashboard", label: "Admin Dashboard" }] : []),
  { href: "/account/profile", label: "Kelola Profil" },
  { href: "/account/addresses", label: "Address Book" },
  { href: "/account/wishlist", label: "Wishlist" },
  { href: "/account/orders", label: "Riwayat Pesanan" },
  { href: "/account/become-creator", label: "Ajukan Upgrade Creator" },
  { href: "/notifications", label: "Notifikasi" },
];

/** The account links reused by both the desktop dropdown and the mobile drawer. */
export function AccountMenuLinks({ user, onNavigate }: { user: User | null; onNavigate: () => void }) {
  return (
    <div className="flex flex-col">
      {ACCOUNT_LINKS(user?.role === "admin").map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={onNavigate}
          className="px-5 py-2 font-body text-sm text-text-primary hover:bg-background md:px-5"
        >
          {link.label}
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
  return (
    <div className="relative" onMouseEnter={onOpen} onMouseLeave={onScheduleClose}>
      <button type="button" className="flex items-center gap-2">
        <span className="size-8 rounded-full bg-border" />
        <span className="font-body text-sm font-medium text-text-primary">{user.name}</span>
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
            Keluar
          </button>
        </div>
      )}
    </div>
  );
}
