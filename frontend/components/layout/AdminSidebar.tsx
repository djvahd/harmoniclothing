import SidebarNav from "./SidebarNav";

const groups = [
  { items: [{ href: "/admin/dashboard", label: "Dashboard" }] },
  {
    label: "MANAJEMEN",
    items: [
      { href: "/admin/pengguna", label: "Kelola User & Creator" },
      { href: "/admin/approval-creator", label: "Approval Creator" },
      { href: "/admin/approval-desain", label: "Approval Desain" },
      { href: "/admin/katalog", label: "Kelola Product Catalog" },
    ],
  },
  {
    label: "OPERASIONAL",
    items: [
      { href: "/admin/produksi", label: "Kelola Antrian Produksi" },
      { href: "/admin/pesanan", label: "Kelola Pesanan" },
      { href: "/admin/pembayaran", label: "Kelola Pembayaran & Invoice" },
      { href: "/admin/pengiriman", label: "Kelola Pengiriman" },
    ],
  },
  {
    label: "KOMUNIKASI",
    items: [
      { href: "/admin/chat", label: "Chat Management" },
      { href: "/admin/notifikasi-config", label: "Konfigurasi Notifikasi" },
    ],
  },
  {
    label: "LAPORAN",
    items: [{ href: "/admin/laporan", label: "Sales Report" }],
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
