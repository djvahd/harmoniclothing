import SidebarNav from "./SidebarNav";

const groups = [
  {
    items: [
      { href: "/account/profile", label: "Profil" },
      { href: "/account/addresses", label: "Address Book" },
      { href: "/account/orders", label: "Riwayat Pesanan" },
      { href: "/account/wishlist", label: "Wishlist" },
      { href: "/account/become-creator", label: "Ajukan Upgrade Creator" },
      { href: "/notifications", label: "Notifikasi" },
    ],
  },
];

export default function AccountSidebar({ className }: { className?: string }) {
  return <SidebarNav groups={groups} className={className} />;
}
