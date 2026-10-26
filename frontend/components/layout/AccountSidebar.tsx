"use client";

import { useTranslations } from "next-intl";
import SidebarNav from "./SidebarNav";
import { creatorEntry, useCreatorApplication } from "@/hooks/useCreatorApplication";

export default function AccountSidebar({ className }: { className?: string }) {
  const t = useTranslations("customer.accountSidebar");
  const { applied, status } = useCreatorApplication();
  const creator = creatorEntry(applied, status);
  const groups = [
    {
      items: [
        { href: "/account/profile", label: t("profile") },
        { href: "/account/addresses", label: t("addresses") },
        { href: "/account/orders", label: t("orders") },
        { href: "/account/wishlist", label: t("wishlist") },
        { href: creator.href, label: t(creator.key) },
        { href: "/notifications", label: t("notifications") },
      ],
    },
  ];
  return <SidebarNav groups={groups} className={className} />;
}
