"use client";

import { useTranslations } from "next-intl";
import SidebarNav from "./SidebarNav";

export default function CreatorSidebar({ className }: { className?: string }) {
  const t = useTranslations("creator.sidebar");
  const groups = [
    {
      items: [
        { href: "/creator/dashboard", label: t("dashboard") },
        { href: "/creator/profile", label: t("profile") },
        { href: "/creator/verification", label: t("verification") },
        { href: "/creator/designs", label: t("manageDesigns") },
        { href: "/creator/designs/upload", label: t("uploadDesign") },
        { href: "/creator/earnings", label: t("earnings") },
      ],
    },
  ];
  return <SidebarNav groups={groups} className={className} />;
}
