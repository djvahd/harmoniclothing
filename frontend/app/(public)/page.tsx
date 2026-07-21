"use client";

import Link from "next/link";
import Image from "next/image";
import useSWR from "swr";
import { ArrowRight, ClipboardCheck, Palette, ShoppingBag, Truck } from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";
import DesignCard from "@/components/ui/DesignCard";
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
    rating: 5,
  },
  {
    quote: "Proses custom desainnya gampang banget, hasilnya sesuai ekspektasi.",
    name: "Sarah Amelia",
    role: "Mahasiswa",
    rating: 5,
  },
  {
    quote: "Pengiriman cepat dan tim CS-nya responsif kalau ada kendala.",
    name: "Rizky Ramadhan",
    role: "Pemilik Toko Online",
    rating: 4,
  },
  {
    quote: "Beli desain dari Marketplace terus tinggal cetak ke produk, praktis banget.",
    name: "Nadia Kirana",
    role: "Content Creator",
    rating: 5,
  },
  {
    quote: "Order bulk buat acara komunitas lancar, harga per pcs jadi jauh lebih murah.",
    name: "Fajar Nugroho",
    role: "Ketua Komunitas Motor",
    rating: 5,
  },
  {
    quote: "Sebagai kreator, royalti dari desain yang kejual kelihatan jelas di dashboard.",
    name: "Bella Anastasya",
    role: "Kreator Desain",
    rating: 4,
  },
  {
    quote: "Bahan hoodie-nya tebal dan sablonnya awet, udah dicuci berkali-kali masih bagus.",
    name: "Yoga Pratama",
    role: "Pemilik Clothing Line",
    rating: 5,
  },
  {
    quote: "Revisi desain gampang lewat editor, nggak perlu bolak-balik chat admin.",
    name: "Putri Wulandari",
    role: "Event Organizer",
    rating: 4,
  },
];

export default function BerandaPage() {
  const { data: productsData } = useSWR("/catalog/products?home", () => getProducts({ per_page: 8 }));
  const { data: designsData } = useSWR("/marketplace/designs?home", () => getDesigns({ per_page: 8 }));

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

      <section className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-2 px-4 py-16 md:px-20">
        <p className="font-body text-caption font-bold uppercase tracking-[0.6px] text-primary">
          Cara Kerja
        </p>
        <h2 className="text-center font-heading text-h3 font-semibold text-text-primary md:text-h2">
          Mudah dalam 4 Langkah
        </h2>
        <div className="relative mt-6 flex w-full flex-wrap justify-center gap-10">
          <div className="absolute left-[12%] right-[12%] top-8 hidden border-t-2 border-dashed border-primary/40 md:block" />
          {STEPS.map((step, i) => (
            <StepItem key={step.title} number={i + 1} {...step} />
          ))}
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 py-16 md:px-20">
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-1">
            <p className="font-body text-caption font-bold uppercase tracking-[0.6px] text-primary">
              Produk Populer
            </p>
            <h2 className="font-heading text-h3 font-semibold text-text-primary md:text-h2">
              Beragam Produk, Bebas Berkreasi
            </h2>
          </div>
          <Link href="/katalog" className="shrink-0 font-body text-sm font-medium text-primary">
            Lihat Semua Produk →
          </Link>
        </div>
        <div className="relative overflow-hidden">
          <div className="flex snap-x items-center gap-6 overflow-x-auto pb-2 [mask-image:linear-gradient(to_right,black_92%,transparent_100%)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {(productsData?.data ?? []).map((product) => (
              <div key={product.id} className="shrink-0 snap-start">
                <ProductCard product={product} />
              </div>
            ))}
            <Link
              href="/katalog?sort=populer"
              aria-label="Lihat semua produk terpopuler"
              className="flex size-11 shrink-0 snap-start items-center justify-center rounded-full border border-border bg-surface text-text-primary transition-colors hover:bg-background"
            >
              <ArrowRight className="size-5" />
            </Link>
            <div className="w-10 shrink-0" aria-hidden="true" />
          </div>
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 py-16 md:px-20">
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-1">
            <p className="font-body text-caption font-bold uppercase tracking-[0.6px] text-primary">
              Desain Populer
            </p>
            <h2 className="font-heading text-h3 font-semibold text-text-primary md:text-h2">
              Karya Kreator Pilihan
            </h2>
          </div>
          <Link href="/marketplace-desain" className="shrink-0 font-body text-sm font-medium text-primary">
            Lihat Semua Desain →
          </Link>
        </div>
        <div className="relative overflow-hidden">
          <div className="flex snap-x items-center gap-6 overflow-x-auto pb-2 [mask-image:linear-gradient(to_right,black_92%,transparent_100%)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {(designsData?.data ?? []).map((design) => (
              <div key={design.id} className="shrink-0 snap-start">
                <DesignCard design={design} />
              </div>
            ))}
            <Link
              href="/marketplace-desain?sort=populer"
              aria-label="Lihat semua desain terpopuler"
              className="flex size-11 shrink-0 snap-start items-center justify-center rounded-full border border-border bg-surface text-text-primary transition-colors hover:bg-background"
            >
              <ArrowRight className="size-5" />
            </Link>
            <div className="w-10 shrink-0" aria-hidden="true" />
          </div>
        </div>
      </section>

      <section className="flex w-full flex-col items-center gap-2 py-16">
        <p className="font-body text-caption font-bold uppercase tracking-[0.6px] text-primary">
          Apa Kata Mereka
        </p>
        <h2 className="text-center font-heading text-h3 font-semibold text-text-primary md:text-h2">
          Dipercaya Banyak Kreator & Brand
        </h2>
        <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent_0%,black_5%,black_95%,transparent_100%)]">
          <div className="flex w-max animate-marquee gap-6 hover:[animation-play-state:paused]">
            {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
              <TestimonialCard key={`${t.name}-${i}`} {...t} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 md:px-20">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col items-start justify-between gap-6 rounded-lg bg-primary px-8 py-10 md:flex-row md:items-center">
          <div className="flex flex-col gap-2">
            <h2 className="font-heading text-h3 font-bold leading-snug text-text-on-accent">
              Siap Mewujudkan
              <br />
              Ide Menjadi Produk Nyata?
            </h2>
            <p className="font-body text-body-sm text-text-on-accent">
              Gabung bersama ribuan kreator dan brand yang percaya pada Harmoni.
            </p>
          </div>
          <div className="flex shrink-0 gap-3">
            <Link href="/katalog">
              <Button variant="primary" className="!bg-white !text-primary hover:!bg-white/90">
                Mulai Custom Design →
              </Button>
            </Link>
            <Link href="/register">
              <Button
                variant="secondary"
                className="!border-white !bg-transparent !text-text-on-accent hover:!bg-white/10"
              >
                Daftar Gratis →
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
