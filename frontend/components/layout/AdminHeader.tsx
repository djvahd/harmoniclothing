"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, ChevronDown, Menu } from "lucide-react";
import Logo from "./Logo";
import MobileDrawer from "./MobileDrawer";
import AdminSidebar from "./AdminSidebar";
import { useAuthStore } from "@/store/auth-store";

export default function AdminHeader() {
  const { user, logout } = useAuthStore();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
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
            <p className="font-body text-caption text-text-secondary">Admin</p>
          </div>
          <button type="button" onClick={() => logout()} aria-label="Keluar">
            <ChevronDown className="size-3.5 text-text-secondary" />
          </button>
        </div>
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
        <AdminSidebar className="w-full border-0 p-0" onNavigate={() => setDrawerOpen(false)} />
      </MobileDrawer>
    </header>
  );
}
