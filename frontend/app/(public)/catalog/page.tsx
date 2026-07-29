import type { Metadata } from "next";
import CatalogListClient from "./CatalogListClient";

export const metadata: Metadata = {
  title: "Katalog Produk",
  description:
    "Pilih dari berbagai jenis produk blank berkualitas tinggi, siap kamu kustomisasi sesuai keinginan sendiri.",
};

export default function CatalogPage() {
  return <CatalogListClient />;
}
