"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { Bell, ChevronDown, Menu, Palette, ShoppingCart } from "lucide-react";
import Logo from "./Logo";
import MobileDrawer from "./MobileDrawer";
import Button from "@/components/ui/Button";
import { useAuthStore } from "@/store/auth-store";
import { getCart } from "@/services/cart";
import { getNotifications } from "@/services/notifications";

const NAV_LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/katalog", label: "Produk" },
  { href: "/marketplace-desain", label: "Marketplace" },
  { href: "/tentang-kami", label: "Tentang Kami" },
];

export default function SiteHeader() {
  const { user, logout } = useAuthStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const { data: cart } = useSWR(user ? "/cart" : null, getCart);
  const { data: notifications } = useSWR(user ? "/notifications" : null, getNotifications);
  const cartCount = cart?.data.length ?? 0;
  const unreadCount = notifications?.data.filter((n) => !n.is_read).length ?? 0;

  return (
    <header className="flex w-full items-center justify-between border-b border-border bg-surface px-4 py-4 md:px-8">
      <Logo />

      <nav className="hidden items-center gap-6 font-body text-sm text-text-primary md:flex">
        {NAV_LINKS.map((link) => (
          <Link key={link.href} href={link.href}>
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="hidden items-center gap-4 md:flex">
        {user ? (
          <>
            <Link href="/keranjang" className="relative text-text-primary">
              <ShoppingCart className="size-5" />
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-1.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link href="/notifikasi" className="relative text-text-primary">
              <Bell className="size-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-2 -top-1.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </Link>
            <span className="h-6 w-px bg-border" />
            <Link href="/creator/dashboard" className="flex items-center gap-1.5 text-text-primary">
              <Palette className="size-4" />
              <span className="font-body text-sm font-medium">Kreator</span>
            </Link>
            <div className="relative">
              <button
                type="button"
                onClick={() => setAccountOpen((v) => !v)}
                className="flex items-center gap-2"
              >
                <span className="size-8 rounded-full bg-border" />
                <span className="font-body text-sm font-medium text-text-primary">
                  {user.name}
                </span>
                <ChevronDown className="size-3.5 text-text-secondary" />
              </button>
              {accountOpen && (
                <div className="absolute right-0 top-full z-40 mt-2 w-64 rounded-md border border-border bg-surface py-2 shadow-lg">
                  <AccountMenuLinks onNavigate={() => setAccountOpen(false)} />
                  <div className="my-1 border-t border-border" />
                  <button
                    type="button"
                    onClick={() => {
                      setAccountOpen(false);
                      logout();
                    }}
                    className="w-full px-5 py-2 text-left font-body text-sm text-text-primary hover:bg-background"
                  >
                    Keluar
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link href="/login">
              <Button variant="secondary">Masuk</Button>
            </Link>
            <Link href="/register">
              <Button variant="primary">Daftar Gratis</Button>
            </Link>
          </>
        )}
      </div>

      <button
        type="button"
        aria-label="Buka menu"
        className="text-text-primary md:hidden"
        onClick={() => setDrawerOpen(true)}
      >
        <Menu className="size-6" />
      </button>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <nav className="flex flex-col gap-4 font-body text-sm text-text-primary">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setDrawerOpen(false)}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-border pt-4">
          {user ? (
            <div className="flex flex-col gap-3">
              <AccountMenuLinks onNavigate={() => setDrawerOpen(false)} />
              <button
                type="button"
                onClick={() => {
                  setDrawerOpen(false);
                  logout();
                }}
                className="text-left font-body text-sm text-text-primary"
              >
                Keluar
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Link href="/login" onClick={() => setDrawerOpen(false)}>
                <Button variant="secondary" fullWidth>
                  Masuk
                </Button>
              </Link>
              <Link href="/register" onClick={() => setDrawerOpen(false)}>
                <Button variant="primary" fullWidth>
                  Daftar Gratis
                </Button>
              </Link>
            </div>
          )}
        </div>
      </MobileDrawer>
    </header>
  );
}

function AccountMenuLinks({ onNavigate }: { onNavigate: () => void }) {
  const links = [
    { href: "/akun/profil", label: "Kelola Profil" },
    { href: "/akun/alamat", label: "Address Book" },
    { href: "/akun/wishlist", label: "Wishlist" },
    { href: "/akun/pesanan", label: "Riwayat Pesanan" },
    { href: "/akun/upgrade-creator", label: "Ajukan Upgrade Creator" },
    { href: "/notifikasi", label: "Notifikasi" },
  ];

  return (
    <div className="flex flex-col">
      {links.map((link) => (
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
