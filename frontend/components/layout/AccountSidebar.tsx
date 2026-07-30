"use client";

import { useTranslations } from "next-intl";
import SidebarNav from "./SidebarNav";

export default function AccountSidebar({ className }: { className?: string }) {
  const t = useTranslations("customer.accountSidebar");
  const groups = [
    {
      items: [
        { href: "/account/profile", label: t("profile") },
        { href: "/account/addresses", label: t("addresses") },
        { href: "/account/orders", label: t("orders") },
        { href: "/account/wishlist", label: t("wishlist") },
        { href: "/account/become-creator", label: t("becomeCreator") },
        { href: "/notifications", label: t("notifications") },
      ],
    },
  ];
  return <SidebarNav groups={groups} className={className} />;
}
