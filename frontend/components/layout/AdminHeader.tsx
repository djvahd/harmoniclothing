"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, ChevronDown, Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import Logo from "./Logo";
import MobileDrawer from "./MobileDrawer";
import AdminSidebar from "./AdminSidebar";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useAuthStore } from "@/store/auth-store";
import { useLogoutConfirm } from "@/hooks/useLogoutConfirm";

export default function AdminHeader() {
  const t = useTranslations("admin.header");
  const tLayout = useTranslations("layout.header");
  const tLogoutConfirm = useTranslations("ui.logoutConfirm");
  const tCommon = useTranslations("common");
  const { user } = useAuthStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { confirmOpen, requestLogout, cancelLogout, confirmLogout } = useLogoutConfirm();

  return (
    <>
    <header className="flex w-full items-center justify-between border-b border-border bg-surface px-4 py-4 md:px-20">
      <Logo />

      <div className="hidden items-center gap-4 md:flex">
        <Link href="/admin/notifications/settings" className="relative text-text-primary">
          <Bell className="size-5" />
        </Link>
        <span className="h-6 w-px bg-border" />
        <div className="flex items-center gap-2.5">
          <span className="size-8 rounded-full bg-border" />
          <div className="flex flex-col">
            <p className="font-body text-body-sm font-medium text-text-primary">{user?.name}</p>
            <p className="font-body text-caption text-text-secondary">{t("adminLabel")}</p>
          </div>
          <button type="button" onClick={() => requestLogout()} aria-label={tLayout("logout")}>
            <ChevronDown className="size-3.5 text-text-secondary" />
          </button>
        </div>
      </div>

      <button
        type="button"
        aria-label={tLayout("openMenu")}
        className="text-text-primary md:hidden"
        onClick={() => setDrawerOpen(true)}
      >
        <Menu className="size-6" />
      </button>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <AdminSidebar className="w-full border-0 p-0" onNavigate={() => setDrawerOpen(false)} />
      </MobileDrawer>
    </header>
    <ConfirmDialog
      open={confirmOpen}
      title={tLogoutConfirm("title")}
      message={tLogoutConfirm("message")}
      confirmLabel={tLayout("logout")}
      cancelLabel={tCommon("cancel")}
      onConfirm={confirmLogout}
      onCancel={cancelLogout}
    />
    </>
  );
}
