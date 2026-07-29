"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import useSWR, { mutate } from "swr";
import clsx from "clsx";
import { Bell, Menu, Palette, ShoppingCart } from "lucide-react";
import Logo from "./Logo";
import MobileDrawer from "./MobileDrawer";
import LanguageSwitcher from "./LanguageSwitcher";
import Button from "@/components/ui/Button";
import ProductThumbnail from "@/components/ui/ProductThumbnail";
import { useAuthStore } from "@/store/auth-store";
import { useAuthModalStore } from "@/store/auth-modal-store";
import { getCart } from "@/services/cart";
import { getNotifications, markNotificationRead } from "@/services/notifications";
import { storageUrl } from "@/lib/storage";
import { formatCurrency, formatDate } from "@/lib/format";

const NAV_LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/catalog", label: "Produk" },
  { href: "/marketplace", label: "Desain" },
  { href: "/about", label: "Tentang Kami" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const openAuthModal = useAuthModalStore((state) => state.open);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: cart } = useSWR(user ? "/cart" : null, getCart);
  const { data: notifications } = useSWR(user ? "/notifications" : null, getNotifications);
  const cartCount = cart?.data.length ?? 0;
  const unreadCount = notifications?.data.filter((n) => !n.is_read).length ?? 0;

  // Cart/notif/account panels render with a visual gap below their trigger
  // icon, so a plain onMouseLeave closes them before the cursor can travel
  // down into the panel. Delay the close and cancel it if the cursor
  // re-enters (either the trigger or the panel itself) within the window.
  function cancelPendingClose() {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
  }
  function openCart() {
    cancelPendingClose();
    setCartOpen(true);
    setNotifOpen(false);
    setAccountOpen(false);
  }
  function openNotif() {
    cancelPendingClose();
    setNotifOpen(true);
    setCartOpen(false);
    setAccountOpen(false);
  }
  function openAccount() {
    cancelPendingClose();
    setAccountOpen(true);
    setCartOpen(false);
    setNotifOpen(false);
  }
  function scheduleClose(setOpen: (v: boolean) => void) {
    cancelPendingClose();
    closeTimeoutRef.current = setTimeout(() => setOpen(false), 250);
  }

  return (
    <header className="flex w-full items-center justify-between border-b border-border bg-surface px-4 py-4 md:grid md:h-[76px] md:grid-cols-[1fr_auto_1fr] md:px-20 md:py-0">
      <div className="md:justify-self-start">
        <Logo />
      </div>

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

      <div className="hidden items-center gap-4 md:flex md:justify-self-end">
        <LanguageSwitcher />
        {user ? (
          <>
            <div
              className="relative"
              onMouseEnter={openCart}
              onMouseLeave={() => scheduleClose(setCartOpen)}
            >
              <button type="button" aria-label="Keranjang" className="relative text-text-primary">
                <ShoppingCart className="size-5" />
                {cartCount > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex size-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-danger-fg">
                    {cartCount}
                  </span>
                )}
              </button>
              {cartOpen && <CartDropdown onClose={() => setCartOpen(false)} />}
            </div>
            <div
              className="relative"
              onMouseEnter={openNotif}
              onMouseLeave={() => scheduleClose(setNotifOpen)}
            >
              <button type="button" aria-label="Notifikasi" className="relative text-text-primary">
                <Bell className="size-5" />
                {unreadCount > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex size-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-danger-fg">
                    {unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && <NotificationsDropdown onClose={() => setNotifOpen(false)} />}
            </div>
            <span className="h-6 w-px bg-border" />
            <Link
              href="/creator/dashboard"
              className={clsx(
                "relative flex items-center gap-1.5 py-1 transition-colors after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:bg-primary after:transition-all after:content-['']",
                pathname.startsWith("/creator")
                  ? "font-semibold text-primary after:w-full"
                  : "text-text-primary after:w-0 hover:text-primary hover:after:w-full",
              )}
            >
              <Palette className="size-4" />
              <span className="font-body text-sm font-medium">Kreator</span>
            </Link>
            <div
              className="relative"
              onMouseEnter={openAccount}
              onMouseLeave={() => scheduleClose(setAccountOpen)}
            >
              <button type="button" className="flex items-center gap-2">
                <span className="size-8 rounded-full bg-border" />
                <span className="font-body text-sm font-medium text-text-primary">
                  {user.name}
                </span>
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
            <Button variant="secondary" onClick={() => openAuthModal("login")}>
              Masuk
            </Button>
            <Button variant="primary" onClick={() => openAuthModal("register")}>
              Daftar Gratis
            </Button>
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
              <Button
                variant="secondary"
                fullWidth
                onClick={() => {
                  setDrawerOpen(false);
                  openAuthModal("login");
                }}
              >
                Masuk
              </Button>
              <Button
                variant="primary"
                fullWidth
                onClick={() => {
                  setDrawerOpen(false);
                  openAuthModal("register");
                }}
              >
                Daftar Gratis
              </Button>
            </div>
          )}
        </div>
      </MobileDrawer>
    </header>
  );
}

function AccountMenuLinks({ onNavigate }: { onNavigate: () => void }) {
  const user = useAuthStore((state) => state.user);
  const links = [
    ...(user?.role === "admin"
      ? [{ href: "/admin/dashboard", label: "Admin Dashboard" }]
      : []),
    { href: "/account/profile", label: "Kelola Profil" },
    { href: "/account/addresses", label: "Address Book" },
    { href: "/account/wishlist", label: "Wishlist" },
    { href: "/account/orders", label: "Riwayat Pesanan" },
    { href: "/account/become-creator", label: "Ajukan Upgrade Creator" },
    { href: "/notifications", label: "Notifikasi" },
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
  const { data, isLoading } = useSWR("/cart", getCart);
  const items = (data?.data ?? []).slice(0, 3);
  const total = data?.data.length ?? 0;
  const subtotal = (data?.data ?? []).reduce((sum, item) => sum + Number(item.subtotal), 0);

  return (
    <div className="absolute right-0 top-full z-40 mt-2 w-[340px] rounded-md border border-border bg-surface shadow-lg">
      <div className="flex items-center justify-between px-5 py-3">
        <p className="font-body text-sm font-semibold text-text-primary">
          Keranjang {!isLoading && `(${total})`}
        </p>
        <Link href="/cart" onClick={onClose} className="font-body text-sm font-medium text-primary">
          Lihat Semua
        </Link>
      </div>
      <div className="border-t border-border" />
      {isLoading ? (
        <div className="flex animate-pulse flex-col gap-3.5 px-5 py-3.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="size-10 shrink-0 rounded-sm bg-border" />
              <div className="flex flex-1 flex-col gap-1.5">
                <div className="h-3 w-3/5 rounded-sm bg-border" />
                <div className="h-3 w-2/5 rounded-sm bg-border" />
              </div>
              <div className="h-3 w-12 rounded-sm bg-border" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
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
  const { data, isLoading } = useSWR("/notifications", getNotifications);
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
      {isLoading ? (
        <div className="flex animate-pulse flex-col">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-start gap-2.5 px-5 py-3">
              <div className="flex-1 flex flex-col gap-1.5">
                <div className="h-3 w-4/5 rounded-sm bg-border" />
                <div className="h-2.5 w-1/3 rounded-sm bg-border" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
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
                  {formatDate(n.created_at)}
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
        <Link href="/notifications" onClick={onClose} className="font-body text-xs font-medium text-primary">
          Lihat Semua
        </Link>
      </div>
    </div>
  );
}
