import type { Metadata } from "next";
import MarketplaceListClient from "./MarketplaceListClient";

export const metadata: Metadata = {
  title: "Lapak Desain",
  description:
    "Jelajahi ribuan desain siap pakai dari kreator lokal, atau jadi kreator dan dapatkan komisi dari setiap penjualan.",
};

export default function MarketplacePage() {
  return <MarketplaceListClient />;
}
