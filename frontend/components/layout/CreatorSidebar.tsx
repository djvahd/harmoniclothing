import SidebarNav from "./SidebarNav";

const groups = [
  {
    items: [
      { href: "/creator/dashboard", label: "Dashboard" },
      { href: "/creator/verification", label: "Verifikasi Data Diri" },
      { href: "/creator/designs", label: "Kelola Desain" },
      { href: "/creator/designs/upload", label: "Upload Desain" },
      { href: "/creator/earnings", label: "Statistik & Komisi" },
    ],
  },
];

export default function CreatorSidebar({ className }: { className?: string }) {
  return <SidebarNav groups={groups} className={className} />;
}
