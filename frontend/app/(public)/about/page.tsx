import type { Metadata } from "next";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
  title: "Tentang Kami",
  description:
    "Platform konveksi modern yang menghubungkan brand, individu, dan kreator lokal untuk menciptakan apparel custom.",
};

export default function AboutPage() {
  return <AboutClient />;
}
