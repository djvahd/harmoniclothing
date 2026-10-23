"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";
import { useTranslations } from "next-intl";

export default function SidebarPageShell({
  sidebar,
  children,
}: {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}) {
  const t = useTranslations("layout.header");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // The menu is collapsed behind a button below md; close it after navigating.
  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 py-8 md:flex-row md:px-20">
      <aside className="flex flex-col gap-2 md:sticky md:top-8 md:self-start">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex items-center justify-between rounded-sm border border-border bg-surface px-4 py-2.5 font-body text-sm font-medium text-text-primary md:hidden"
        >
          {t("openMenu")}
          <ChevronDown className={clsx("size-4 transition-transform", open && "rotate-180")} />
        </button>
        <div className={clsx(!open && "hidden", "md:block")}>{sidebar}</div>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
