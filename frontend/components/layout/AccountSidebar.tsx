import SidebarNav from "./SidebarNav";

const groups = [
  {
    items: [
      { href: "/akun/profil", label: "Profil" },
      { href: "/akun/alamat", label: "Address Book" },
      { href: "/akun/pesanan", label: "Riwayat Pesanan" },
      { href: "/akun/wishlist", label: "Wishlist" },
      { href: "/akun/upgrade-creator", label: "Ajukan Upgrade Creator" },
      { href: "/notifikasi", label: "Notifikasi" },
    ],
  },
];

export default function AccountSidebar({ className }: { className?: string }) {
  return <SidebarNav groups={groups} className={className} />;
}
