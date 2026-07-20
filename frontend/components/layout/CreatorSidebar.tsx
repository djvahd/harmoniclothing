import SidebarNav from "./SidebarNav";

const groups = [
  {
    items: [
      { href: "/creator/dashboard", label: "Dashboard" },
      { href: "/creator/verifikasi", label: "Verifikasi Data Diri" },
      { href: "/creator/desain", label: "Kelola Desain" },
      { href: "/creator/desain/upload", label: "Upload Desain" },
      { href: "/creator/statistik", label: "Statistik & Komisi" },
    ],
  },
];

export default function CreatorSidebar({ className }: { className?: string }) {
  return <SidebarNav groups={groups} className={className} />;
}
