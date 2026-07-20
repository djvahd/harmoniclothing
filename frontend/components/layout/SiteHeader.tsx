"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR, { mutate } from "swr";
import { Bell, ChevronDown, Menu, Palette, ShoppingCart } from "lucide-react";
import Logo from "./Logo";
import MobileDrawer from "./MobileDrawer";
import Button from "@/components/ui/Button";
import ProductThumbnail from "@/components/ui/ProductThumbnail";
import { useAuthStore } from "@/store/auth-store";
import { getCart } from "@/services/cart";
import { getNotifications, markNotificationRead } from "@/services/notifications";
import { storageUrl } from "@/lib/storage";
import { formatCurrency } from "@/lib/format";

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
  const [cartOpen, setCartOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

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
            <div className="relative">
              <button
                type="button"
                aria-label="Keranjang"
                onClick={() => {
                  setCartOpen((v) => !v);
                  setNotifOpen(false);
                  setAccountOpen(false);
                }}
                className="relative text-text-primary"
              >
                <ShoppingCart className="size-5" />
                {cartCount > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </button>
              {cartOpen && <CartDropdown onClose={() => setCartOpen(false)} />}
            </div>
            <div className="relative">
              <button
                type="button"
                aria-label="Notifikasi"
                onClick={() => {
                  setNotifOpen((v) => !v);
                  setCartOpen(false);
                  setAccountOpen(false);
                }}
                className="relative text-text-primary"
              >
                <Bell className="size-5" />
                {unreadCount > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && <NotificationsDropdown onClose={() => setNotifOpen(false)} />}
            </div>
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

function CartDropdown({ onClose }: { onClose: () => void }) {
  const { data } = useSWR("/cart", getCart);
  const items = (data?.data ?? []).slice(0, 3);
  const total = data?.data.length ?? 0;
  const subtotal = (data?.data ?? []).reduce((sum, item) => sum + Number(item.subtotal), 0);

  return (
    <div className="absolute right-0 top-full z-40 mt-2 w-[340px] rounded-md border border-border bg-surface shadow-lg">
      <div className="flex items-center justify-between px-5 py-3">
        <p className="font-body text-sm font-semibold text-text-primary">Keranjang ({total})</p>
        <Link href="/keranjang" onClick={onClose} className="font-body text-sm font-medium text-primary">
          Lihat Semua
        </Link>
      </div>
      <div className="border-t border-border" />
      {items.length === 0 ? (
        <p className="px-5 py-6 text-center font-body text-sm text-text-secondary">
          Keranjangmu masih kosong.
        </p>
      ) : (
        <div className="flex flex-col gap-3.5 px-5 py-3.5">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <ProductThumbnail
                src={storageUrl(
                  item.design?.thumbnail_path ?? item.product_variant.mockup_asset_path,
                )}
                alt={item.product_variant.product?.name ?? "Produk"}
                size={40}
              />
              <div className="flex flex-1 flex-col gap-0.5">
                <p className="font-body text-sm font-medium text-text-primary">
                  {item.product_variant.product?.name ?? "Produk"}
                </p>
                <p className="font-body text-xs text-text-secondary">
                  {item.product_variant.size} · {item.product_variant.color}
                </p>
              </div>
              <p className="font-body text-sm font-semibold text-text-primary">
                {formatCurrency(item.subtotal)}
              </p>
            </div>
          ))}
        </div>
      )}
      {items.length > 0 && (
        <>
          <div className="border-t border-border" />
          <div className="flex flex-col gap-3 px-5 py-3.5">
            <div className="flex items-center justify-between">
              <p className="font-body text-sm text-text-secondary">Subtotal</p>
              <p className="font-body text-sm font-semibold text-text-primary">
                {formatCurrency(subtotal)}
              </p>
            </div>
            <Link href="/checkout" onClick={onClose}>
              <Button fullWidth>Lanjut ke Checkout</Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

function NotificationsDropdown({ onClose }: { onClose: () => void }) {
  const { data } = useSWR("/notifications", getNotifications);
  const items = (data?.data ?? []).slice(0, 3);

  async function handleMarkAllRead() {
    const unread = (data?.data ?? []).filter((n) => !n.is_read);
    await Promise.all(unread.map((n) => markNotificationRead(n.id)));
    await mutate("/notifications");
  }

  return (
    <div className="absolute right-0 top-full z-40 mt-2 w-[360px] rounded-md border border-border bg-surface shadow-lg">
      <div className="px-5 py-3">
        <p className="font-body text-sm font-semibold text-text-primary">Notifikasi</p>
      </div>
      <div className="border-t border-border" />
      {items.length === 0 ? (
        <p className="px-5 py-6 text-center font-body text-sm text-text-secondary">
          Belum ada notifikasi.
        </p>
      ) : (
        <div className="flex flex-col">
          {items.map((n) => (
            <div key={n.id} className="flex items-start gap-2.5 px-5 py-3">
              {!n.is_read && <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />}
              <div className={n.is_read ? "ml-4 flex-1" : "flex-1"}>
                <p className="font-body text-sm text-text-primary">{n.title}</p>
                <p className="font-body text-xs text-text-secondary">
                  {new Date(n.created_at).toLocaleDateString("id-ID")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="border-t border-border" />
      <div className="flex items-center justify-between px-5 py-3">
        <button
          type="button"
          onClick={handleMarkAllRead}
          className="font-body text-xs font-medium text-text-secondary"
        >
          Tandai semua dibaca
        </button>
        <Link href="/notifikasi" onClick={onClose} className="font-body text-xs font-medium text-primary">
          Lihat Semua
        </Link>
      </div>
    </div>
  );
}
