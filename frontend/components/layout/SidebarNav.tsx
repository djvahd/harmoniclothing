"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/store/auth-store";

export interface SidebarGroup {
  label?: string;
  items: { href: string; label: string }[];
}

interface SidebarNavProps {
  groups: SidebarGroup[];
  className?: string;
  onNavigate?: () => void;
}

export default function SidebarNav({ groups, className, onNavigate }: SidebarNavProps) {
  const t = useTranslations("layout.header");
  const pathname = usePathname();
  const logout = useAuthStore((state) => state.logout);

  return (
    <nav
      className={clsx(
        "flex w-[260px] flex-col gap-0.5 rounded-md border border-border bg-surface p-3",
        className,
      )}
    >
      {groups.map((group, i) => (
        <div key={group.label ?? i} className="flex flex-col">
          {group.label && (
            <p className="px-3 pb-1 pt-5 font-body text-xs font-bold tracking-[0.6px] text-text-secondary">
              {group.label}
            </p>
          )}
          {group.items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={clsx(
                "rounded-sm px-3 py-2.5 font-body text-sm font-medium",
                pathname === item.href
                  ? "bg-accent/10 text-accent"
                  : "text-text-secondary hover:bg-background",
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      ))}
      <div className="my-1 border-t border-border" />
      <button
        type="button"
        onClick={() => logout()}
        className="rounded-sm px-3 py-2.5 text-left font-body text-sm font-medium text-text-secondary hover:bg-background"
      >
        {t("logout")}
      </button>
    </nav>
  );
}
