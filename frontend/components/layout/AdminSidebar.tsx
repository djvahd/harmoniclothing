"use client";

import { useTranslations } from "next-intl";
import SidebarNav from "./SidebarNav";

export default function AdminSidebar({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  const t = useTranslations("admin.sidebar");
  const groups = [
    { items: [{ href: "/admin/dashboard", label: t("dashboard") }] },
    {
      label: t("groups.management"),
      items: [
        { href: "/admin/users", label: t("items.users") },
        { href: "/admin/creators/approval", label: t("items.creatorApproval") },
        { href: "/admin/designs/approval", label: t("items.designApproval") },
        { href: "/admin/catalog", label: t("items.catalog") },
      ],
    },
    {
      label: t("groups.operations"),
      items: [
        { href: "/admin/production", label: t("items.production") },
        { href: "/admin/orders", label: t("items.orders") },
        { href: "/admin/payments", label: t("items.payments") },
        { href: "/admin/payouts", label: t("items.payouts") },
        { href: "/admin/shipments", label: t("items.shipments") },
      ],
    },
    {
      label: t("groups.communication"),
      items: [
        { href: "/admin/chat", label: t("items.chat") },
        { href: "/admin/notifications/settings", label: t("items.notificationSettings") },
      ],
    },
    {
      label: t("groups.reports"),
      items: [
        { href: "/admin/reports", label: t("items.salesReport") },
        { href: "/admin/audit-log", label: t("items.auditLog") },
      ],
    },
  ];
  return <SidebarNav
      groups={groups}
      className={className}
      onNavigate={onNavigate}
      ariaLabel={t("menuLabel")}
    />;
}
