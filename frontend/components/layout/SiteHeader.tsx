"use client";

import { useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, Palette } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import { useTranslations } from "next-intl";
import Logo from "./Logo";
import MobileDrawer from "./MobileDrawer";
import LanguageSwitcher from "./LanguageSwitcher";
import HeaderNav from "./HeaderNav";
import CartPopover from "./CartPopover";
import NotificationPopover from "./NotificationPopover";
import AccountMenu, { AccountMenuLinks } from "./AccountMenu";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useAuthStore } from "@/store/auth-store";
import { useAuthModalStore } from "@/store/auth-modal-store";
import { useLogoutConfirm } from "@/hooks/useLogoutConfirm";

type Panel = "cart" | "notif" | "account" | null;

export default function SiteHeader() {
  const t = useTranslations("layout.header");
  const tLogoutConfirm = useTranslations("ui.logoutConfirm");
  const tCommon = useTranslations("common");
  const pathname = usePathname();
  const { user, status } = useAuthStore();
  const openAuthModal = useAuthModalStore((state) => state.open);
  const { confirmOpen, requestLogout, cancelLogout, confirmLogout } = useLogoutConfirm();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openPanel, setOpenPanel] = useState<Panel>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cart/notif/account panels render with a visual gap below their trigger
  // icon, so a plain onMouseLeave closes them before the cursor can travel
  // down into the panel. Delay the close and cancel it if the cursor
  // re-enters (either the trigger or the panel itself) within the window.
  function cancelPendingClose() {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
  }
  function openPanelNow(panel: Panel) {
    cancelPendingClose();
    setOpenPanel(panel);
  }
  function scheduleClosePanel(panel: Panel) {
    cancelPendingClose();
    closeTimeoutRef.current = setTimeout(
      () => setOpenPanel((current) => (current === panel ? null : current)),
      250,
    );
  }

  return (
    <>
    <header className="flex w-full items-center justify-between border-b border-border bg-surface px-4 py-4 lg:grid lg:h-[76px] lg:grid-cols-[1fr_auto_1fr] lg:gap-x-8 lg:px-20 lg:py-0">
      <div className="lg:justify-self-start">
        <Logo />
      </div>

      {status === "ready" && (
        <>
      <HeaderNav variant="desktop" pathname={pathname} className="animate-fade-slide-in" />

      <div className="hidden animate-fade-slide-in items-center gap-4 lg:flex lg:justify-self-end">
        <LanguageSwitcher />
        {user ? (
          <>
            <CartPopover
              open={openPanel === "cart"}
              onOpen={() => openPanelNow("cart")}
              onScheduleClose={() => scheduleClosePanel("cart")}
              onCancelClose={cancelPendingClose}
              onNavigate={() => setOpenPanel(null)}
            />
            <NotificationPopover
              open={openPanel === "notif"}
              onOpen={() => openPanelNow("notif")}
              onScheduleClose={() => scheduleClosePanel("notif")}
              onCancelClose={cancelPendingClose}
              onNavigate={() => setOpenPanel(null)}
            />
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
              <span className="font-body text-sm font-medium">{t("creator")}</span>
            </Link>
            <AccountMenu
              user={user}
              open={openPanel === "account"}
              onOpen={() => openPanelNow("account")}
              onScheduleClose={() => scheduleClosePanel("account")}
              onCancelClose={cancelPendingClose}
              onNavigate={() => setOpenPanel(null)}
              onLogout={() => {
                setOpenPanel(null);
                requestLogout();
              }}
            />
          </>
        ) : (
          <>
            <Button variant="secondary" onClick={() => openAuthModal("login")}>
              {t("login")}
            </Button>
            <Button variant="primary" onClick={() => openAuthModal("register")}>
              {t("registerFree")}
            </Button>
          </>
        )}
      </div>

      <button
        type="button"
        aria-label={t("openMenu")}
        className="animate-fade-slide-in text-text-primary lg:hidden"
        onClick={() => setDrawerOpen(true)}
      >
        <Menu className="size-6" />
      </button>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <HeaderNav variant="mobile" pathname={pathname} onNavigate={() => setDrawerOpen(false)} />
        <div className="border-t border-border pt-4">
          {user ? (
            <div className="flex flex-col gap-3">
              <AccountMenuLinks user={user} onNavigate={() => setDrawerOpen(false)} />
              <button
                type="button"
                onClick={() => {
                  setDrawerOpen(false);
                  requestLogout();
                }}
                className="text-left font-body text-sm text-text-primary"
              >
                {t("logout")}
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
                {t("login")}
              </Button>
              <Button
                variant="primary"
                fullWidth
                onClick={() => {
                  setDrawerOpen(false);
                  openAuthModal("register");
                }}
              >
                {t("registerFree")}
              </Button>
            </div>
          )}
        </div>
      </MobileDrawer>
        </>
      )}
    </header>
    <ConfirmDialog
      open={confirmOpen}
      title={tLogoutConfirm("title")}
      message={tLogoutConfirm("message")}
      confirmLabel={t("logout")}
      cancelLabel={tCommon("cancel")}
      onConfirm={confirmLogout}
      onCancel={cancelLogout}
    />
    </>
  );
}
