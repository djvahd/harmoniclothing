"use client";

import Link from "next/link";
import Image from "next/image";
import useSWR from "swr";
import { ClipboardCheck, Palette, ShoppingBag, Truck, Award, Zap } from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";
import DesignCard from "@/components/ui/DesignCard";
import FeatureCard from "@/components/ui/FeatureCard";
import TestimonialCard from "@/components/ui/TestimonialCard";
import StepItem from "@/components/ui/StepItem";
import Button from "@/components/ui/Button";
import { getProducts } from "@/services/catalog";
import { getDesigns } from "@/services/marketplace";

const TRUST_ITEMS = [
  { icon: "/hero/trust-icon-1.svg", title: "Tanpa Minimum Order", subtitle: "Pesan 1 pcs pun bisa" },
  { icon: "/hero/trust-icon-2.svg", title: "Kualitas Premium", subtitle: "Bahan terbaik, hasil maksimal" },
  { icon: "/hero/trust-icon-3.svg", title: "Produksi Cepat", subtitle: "Proses efisien & on-time" },
  { icon: "/hero/trust-icon-4.svg", title: "Garansi Kepuasan", subtitle: "100% garansi kualitas" },
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
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(28deg, #f8fafc 25%, #eef6f3 64%, #e0f1ea 96%)" }}
      >
        <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 items-center gap-6 px-4 py-16 md:px-20 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_518px] min-[1440px]:grid-cols-[1fr_690px]">
          <div className="flex flex-col items-start gap-7">
            <h1 className="font-heading text-h3 font-semibold leading-tight text-text-primary md:text-h1 md:leading-[1.1]">
              Wujudkan Ide.
              <br />
              Ciptakan Produk.
              <br />
              <span className="text-accent">Bergerak Bersama.</span>
            </h1>
            <p className="max-w-md font-body text-base text-text-secondary">
              Platform konveksi modern untuk kreator, brand, dan komunitas — custom design, tanpa
              minimum order.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/katalog">
                <Button variant="primary">Mulai Custom Design →</Button>
              </Link>
              <Link href="/katalog">
                <Button variant="secondary">Jelajahi Produk</Button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-7">
              {TRUST_ITEMS.map((item) => (
                <div key={item.title} className="flex items-center gap-2.5">
                  <div className="relative size-8 shrink-0">
                    <Image src="/hero/trust-bg.svg" alt="" fill sizes="32px" priority />
                    <Image
                      src={item.icon}
                      alt=""
                      width={18}
                      height={18}
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                      priority
                    />
                  </div>
                  <div className="flex flex-col">
                    <p className="font-body text-sm font-semibold text-text-primary">{item.title}</p>
                    <p className="font-body text-body-sm text-text-secondary">{item.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden overflow-hidden lg:block lg:h-[289px] lg:w-[380px] xl:h-[395px] xl:w-[518px] min-[1440px]:h-[526px] min-[1440px]:w-[690px]">
          <div className="relative h-[526px] w-[690px] origin-top-left scale-[0.55] xl:scale-[0.75] min-[1440px]:scale-100">
            <div className="absolute left-[50px] top-[408px] h-[118px] w-[578px]">
              <Image src="/hero/podium-shadow.svg" alt="" fill sizes="578px" priority />
            </div>
            <div className="absolute left-0 top-[293px] h-[223px] w-[690px]">
              <Image src="/hero/podium.png" alt="" fill sizes="690px" className="object-cover" priority />
            </div>
            <div className="absolute left-[156px] top-[15px] h-[365px] w-[306px]">
              <Image src="/hero/background.png" alt="" fill sizes="306px" className="object-cover" priority />
            </div>
            <div
              className="absolute flex items-center justify-center"
              style={{ left: 73.9, top: 41.9, width: 302.5, height: 324.2 }}
            >
              <div className="relative h-[293px] w-[268px] rotate-[-7.2deg]">
                <Image src="/hero/hoodie.png" alt="Hoodie" fill sizes="268px" className="object-cover" priority />
              </div>
            </div>
            <div
              className="absolute flex items-center justify-center"
              style={{ left: 163.8, top: 0, width: 485.4, height: 449.3 }}
            >
              <div className="relative h-[374px] w-[420px] rotate-[11.37deg]">
                <Image src="/hero/kaos.png" alt="Kaos" fill sizes="420px" className="object-cover" priority />
              </div>
            </div>
            <div className="absolute left-[45px] top-[137px] h-[57px] w-[58px]">
              <Image src="/hero/benang.png" alt="" fill sizes="58px" className="object-cover" priority />
            </div>
            <div
              className="absolute flex items-center justify-center"
              style={{ left: 7, top: 321, width: 61.2, height: 69.3 }}
            >
              <div className="relative h-[59px] w-[48px] rotate-[-14.66deg]">
                <Image src="/hero/daun.png" alt="" fill sizes="48px" className="object-cover" priority />
              </div>
            </div>
            <div
              className="absolute flex items-center justify-center"
              style={{ left: 537.7, top: 251.6, width: 93.3, height: 73 }}
            >
              <div className="relative h-[70px] w-[91px] rotate-[1.95deg]">
                <Image src="/hero/label.png" alt="" fill sizes="91px" className="object-cover" priority />
              </div>
            </div>
            <div
              className="absolute flex items-center justify-center"
              style={{ left: 449.6, top: 293.5, width: 148.5, height: 114.6 }}
            >
              <div className="relative h-[83px] w-[131px] rotate-15">
                <Image src="/hero/topi.png" alt="" fill sizes="131px" className="object-cover" priority />
              </div>
            </div>

            <div className="absolute left-[406px] top-[374px] flex w-[180px] flex-col gap-1.5 rounded-md bg-white px-4 py-3 shadow-[0px_4px_16px_0px_rgba(0,0,0,0.12)]">
              <p className="font-body text-body-sm font-semibold text-text-primary">Custom by You</p>
              <p className="font-body text-xs text-text-secondary">Made with Harmoni</p>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1.5">
                  {["avatar1", "avatar2", "avatar3", "avatar4"].map((a) => (
                    <div key={a} className="relative size-[22px] rounded-full ring-1 ring-white">
                      <Image src={`/hero/${a}.png`} alt="" fill sizes="22px" className="rounded-full" priority />
                    </div>
                  ))}
                </div>
                <p className="font-body text-xs font-semibold text-text-secondary">12.3K</p>
              </div>
            </div>
          </div>
          </div>
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-4 py-16 md:px-20">
        <h2 className="text-center font-heading text-h3 font-semibold text-text-primary md:text-h2">
          Cara Kerja
        </h2>
        <div className="flex flex-wrap justify-center gap-10">
          {STEPS.map((step, i) => (
            <StepItem key={step.title} number={i + 1} {...step} />
          ))}
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 py-16 md:px-20">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-h3 font-semibold text-text-primary md:text-h2">
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

      <section className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 py-16 md:px-20">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-h3 font-semibold text-text-primary md:text-h2">
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

      <section className="bg-surface px-4 py-16 md:px-20">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8">
          <h2 className="text-center font-heading text-h3 font-semibold text-text-primary md:text-h2">
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

      <section className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-4 py-16 md:px-20">
        <h2 className="text-center font-heading text-h3 font-semibold text-text-primary md:text-h2">
          Apa Kata Mereka
        </h2>
        <div className="flex flex-wrap justify-center gap-6">
          {TESTIMONIALS.map((t) => (
            <TestimonialCard key={t.name} {...t} />
          ))}
        </div>
      </section>

      <section className="px-4 py-16 md:px-20">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-5 rounded-lg bg-primary px-8 py-14 text-center">
          <h2 className="font-heading text-h3 font-semibold text-text-on-accent md:text-h2">
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
