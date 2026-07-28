import SidebarNav from "./SidebarNav";

const groups = [
  { items: [{ href: "/admin/dashboard", label: "Dashboard" }] },
  {
    label: "MANAJEMEN",
    items: [
      { href: "/admin/users", label: "Kelola User & Creator" },
      { href: "/admin/creators/approval", label: "Approval Creator" },
      { href: "/admin/designs/approval", label: "Approval Desain" },
      { href: "/admin/catalog", label: "Kelola Product Catalog" },
    ],
  },
  {
    label: "OPERASIONAL",
    items: [
      { href: "/admin/production", label: "Kelola Antrian Produksi" },
      { href: "/admin/orders", label: "Kelola Pesanan" },
      { href: "/admin/payments", label: "Kelola Pembayaran & Invoice" },
      { href: "/admin/shipments", label: "Kelola Pengiriman" },
    ],
  },
  {
    label: "KOMUNIKASI",
    items: [
      { href: "/admin/chat", label: "Chat Management" },
      { href: "/admin/notifications/settings", label: "Konfigurasi Notifikasi" },
    ],
  },
  {
    label: "LAPORAN",
    items: [{ href: "/admin/reports", label: "Sales Report" }],
  },
];

export default function AdminSidebar({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  return <SidebarNav groups={groups} className={className} onNavigate={onNavigate} />;
}
