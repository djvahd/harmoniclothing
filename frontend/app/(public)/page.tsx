"use client";

import Link from "next/link";
import useSWR from "swr";
import { ClipboardCheck, Package, Palette, ShieldCheck, ShoppingBag, Truck, Zap, Award } from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";
import DesignCard from "@/components/ui/DesignCard";
import FeatureCard from "@/components/ui/FeatureCard";
import TestimonialCard from "@/components/ui/TestimonialCard";
import StepItem from "@/components/ui/StepItem";
import Button from "@/components/ui/Button";
import { getProducts } from "@/services/catalog";
import { getDesigns } from "@/services/marketplace";

const TRUST_ITEMS = [
  { icon: Package, label: "Tanpa Minimum Order" },
  { icon: Award, label: "Kualitas Premium" },
  { icon: Zap, label: "Produksi Cepat" },
  { icon: ShieldCheck, label: "Garansi Kepuasan" },
];

const STEPS = [
  { icon: ShoppingBag, title: "Pilih Produk", description: "Pilih produk favorit sesuai kebutuhanmu" },
  { icon: Palette, title: "Buat Desain", description: "Custom desain sendiri atau pilih dari Marketplace" },
  { icon: ClipboardCheck, title: "Konfirmasi Pesanan", description: "Cek detail dan lakukan pembayaran" },
  { icon: Truck, title: "Terima Produk", description: "Produk diproduksi dan dikirim ke alamatmu" },
];

const TESTIMONIALS = [
  {
    quote: "Kualitas produknya keren, sablonnya rapi dan bahannya nyaman dipakai.",
    name: "Dimas Alfarizi",
    role: "Founder Local Brand",
  },
  {
    quote: "Proses custom desainnya gampang banget, hasilnya sesuai ekspektasi.",
    name: "Sarah Amelia",
    role: "Mahasiswa",
  },
  {
    quote: "Pengiriman cepat dan tim CS-nya responsif kalau ada kendala.",
    name: "Rizky Ramadhan",
    role: "Pemilik Toko Online",
  },
];

export default function BerandaPage() {
  const { data: productsData } = useSWR("/catalog/products?home", () => getProducts({ per_page: 5 }));
  const { data: designsData } = useSWR("/marketplace/designs?home", () => getDesigns({ per_page: 4 }));

  return (
    <div className="flex flex-col">
      <section
        className="flex flex-col gap-8 px-4 py-16 md:px-8"
        style={{ background: "linear-gradient(28deg, #f8fafc 25%, #eef6f3 64%, #e0f1ea 96%)" }}
      >
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 text-center">
          <h1 className="font-heading text-4xl font-semibold text-text-primary md:text-6xl">
            Custom Apparel, Sesuai Gayamu Sendiri
          </h1>
          <p className="max-w-2xl font-body text-base text-text-secondary">
            Desain sendiri atau pilih dari ratusan karya kreator lokal — kami produksi dengan
            kualitas premium, tanpa minimum order.
          </p>
          <div className="flex gap-3">
            <Link href="/katalog">
              <Button variant="primary">Mulai Custom Design</Button>
            </Link>
            <Link href="/marketplace-desain">
              <Button variant="secondary">Jelajahi Marketplace</Button>
            </Link>
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-6">
            {TRUST_ITEMS.map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <item.icon className="size-4 text-primary" />
                <span className="font-body text-sm text-text-secondary">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-16 md:px-8">
        <h2 className="text-center font-heading text-2xl font-semibold text-text-primary md:text-3xl">
          Cara Kerja
        </h2>
        <div className="flex flex-wrap justify-center gap-10">
          {STEPS.map((step, i) => (
            <StepItem key={step.title} number={i + 1} {...step} />
          ))}
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-16 md:px-8">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-2xl font-semibold text-text-primary md:text-3xl">
            Produk Populer
          </h2>
          <Link href="/katalog" className="font-body text-sm font-medium text-primary">
            Lihat Semua
          </Link>
        </div>
        <div className="flex flex-wrap justify-center gap-6 md:justify-start">
          {(productsData?.data ?? []).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-16 md:px-8">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-2xl font-semibold text-text-primary md:text-3xl">
            Desain Populer
          </h2>
          <Link href="/marketplace-desain" className="font-body text-sm font-medium text-primary">
            Lihat Semua
          </Link>
        </div>
        <div className="flex flex-wrap justify-center gap-6 md:justify-start">
          {(designsData?.data ?? []).map((design) => (
            <DesignCard key={design.id} design={design} />
          ))}
        </div>
      </section>

      <section className="bg-surface px-4 py-16 md:px-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
          <h2 className="text-center font-heading text-2xl font-semibold text-text-primary md:text-3xl">
            Kenapa Memilih Harmoni?
          </h2>
          <div className="flex flex-wrap justify-center gap-6">
            <FeatureCard icon={Palette} title="Custom Design Mudah" description="Buat desain sendiri dengan editor intuitif." />
            <FeatureCard icon={ShoppingBag} title="Marketplace Desain" description="Ratusan desain siap pakai dari kreator lokal." />
            <FeatureCard icon={Award} title="Kualitas Premium" description="Bahan dan sablon terstandar untuk hasil terbaik." />
            <FeatureCard icon={Zap} title="Produksi Cepat" description="Estimasi produksi jelas di setiap pesanan." />
          </div>
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-16 md:px-8">
        <h2 className="text-center font-heading text-2xl font-semibold text-text-primary md:text-3xl">
          Apa Kata Mereka
        </h2>
        <div className="flex flex-wrap justify-center gap-6">
          {TESTIMONIALS.map((t) => (
            <TestimonialCard key={t.name} {...t} />
          ))}
        </div>
      </section>

      <section className="px-4 py-16 md:px-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-5 rounded-lg bg-primary px-8 py-14 text-center">
          <h2 className="font-heading text-2xl font-semibold text-text-on-accent md:text-3xl">
            Siap Wujudkan Desainmu Sendiri?
          </h2>
          <p className="max-w-xl font-body text-sm text-text-on-accent/90">
            Daftar sekarang dan mulai custom apparel pertamamu bersama Harmoni Clothing.
          </p>
          <Link href="/register">
            <Button variant="primary" className="bg-accent">
              Daftar Gratis
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
