"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import Image from "next/image";
import useSWR from "swr";
import { ArrowRight, ClipboardCheck, Palette, ShoppingBag, Truck } from "lucide-react";
import ProductCard, { ProductCardSkeleton } from "@/components/ui/ProductCard";
import DesignCard, { DesignCardSkeleton } from "@/components/ui/DesignCard";
import TestimonialCard from "@/components/ui/TestimonialCard";
import StepItem from "@/components/ui/StepItem";
import Reveal from "@/components/ui/Reveal";
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

// depth: signed scroll factor — negative recedes upward (background), positive advances downward (foreground)
// scaleDelta: extra scale applied at max scroll (negative shrinks, positive grows)
// grouped so visually-paired layers move alike without drifting apart, but each layer gets slight
// jitter (phase/amp/freq) so paired layers don't look mechanically identical: podium trio (static),
// hoodie+kaos (garments), daun+benang (ground props — benang now drifts down-right toward daun),
// label+topi+card (bottom-right cluster)
const HERO_MOTION = [
  { depth: -0.08, hFactor: 0.05, ampY: 0, ampX: 0, freq: 0.15, phase: 0.5, scaleDelta: -0.1 },
  { depth: -0.1, hFactor: 0.05, ampY: 0, ampX: 0, freq: 0.15, phase: 0.5, scaleDelta: -0.12 },
  { depth: -0.12, hFactor: 0.05, ampY: 0, ampX: 0, freq: 0.15, phase: 0.5, scaleDelta: -0.14 },
  { depth: 0.08, hFactor: -0.02, ampY: 13, ampX: 5, freq: 0.2, phase: 1, scaleDelta: 0.05 },
  { depth: 0.085, hFactor: 0.03, ampY: 14.5, ampX: 5.5, freq: 0.21, phase: 1.6, scaleDelta: 0.055 },
  { depth: 0.08, hFactor: 0.09, ampY: 15, ampX: 6.5, freq: 0.3, phase: 3.4, scaleDelta: -0.05 },
  { depth: -0.09, hFactor: 0.08, ampY: 16, ampX: 6, freq: 0.28, phase: 4.2, scaleDelta: -0.1 },
  { depth: 0.075, hFactor: -0.09, ampY: 14, ampX: 5.5, freq: 0.23, phase: 1.7, scaleDelta: 0.025 },
  { depth: 0.085, hFactor: -0.11, ampY: 16, ampX: 6.5, freq: 0.25, phase: 2.4, scaleDelta: 0.035 },
  { depth: 0.08, hFactor: -0.1, ampY: 15, ampX: 6, freq: 0.24, phase: 2.1, scaleDelta: 0.03 },
];

const EASE_SETTLE = "cubic-bezier(0.22, 1, 0.36, 1)";
const EASE_POP = "cubic-bezier(0.34, 1.56, 0.64, 1)";

const HERO_ENTRANCE = [
  { x: 0, y: 14, scale: 0.94, rotate: 0, delay: 0, duration: 650, ease: EASE_SETTLE },
  { x: 0, y: 46, scale: 0.95, rotate: 0, delay: 70, duration: 700, ease: EASE_SETTLE },
  { x: 0, y: -22, scale: 0.9, rotate: 0, delay: 0, duration: 700, ease: EASE_SETTLE },
  { x: -170, y: 40, scale: 0.85, rotate: -16, delay: 260, duration: 780, ease: EASE_POP },
  { x: 180, y: -30, scale: 0.85, rotate: 18, delay: 360, duration: 800, ease: EASE_POP },
  { x: -70, y: 55, scale: 0.3, rotate: -20, delay: 460, duration: 700, ease: EASE_POP },
  { x: -55, y: 75, scale: 0.5, rotate: -28, delay: 520, duration: 720, ease: EASE_POP },
  { x: 95, y: -45, scale: 0.55, rotate: 20, delay: 560, duration: 720, ease: EASE_POP },
  { x: 60, y: 85, scale: 0.6, rotate: 22, delay: 600, duration: 720, ease: EASE_POP },
  { x: 45, y: 55, scale: 0.88, rotate: 0, delay: 680, duration: 650, ease: EASE_SETTLE },
];

function getHeroEntranceStyle(index: number, entered: boolean): CSSProperties {
  const cfg = HERO_ENTRANCE[index] ?? HERO_ENTRANCE[HERO_ENTRANCE.length - 1];
  return {
    opacity: entered ? 1 : 0,
    transform: entered
      ? "translate3d(0px, 0px, 0) scale(1) rotate(0deg)"
      : `translate3d(${cfg.x}px, ${cfg.y}px, 0) scale(${cfg.scale}) rotate(${cfg.rotate}deg)`,
    transitionProperty: "transform, opacity",
    transitionDuration: `${cfg.duration}ms`,
    transitionTimingFunction: cfg.ease,
    transitionDelay: `${cfg.delay}ms`,
    willChange: "transform, opacity",
  };
}

export default function BerandaPage() {
  const { data: productsData, isLoading: productsLoading } = useSWR("/catalog/products?home", () =>
    getProducts({ per_page: 8 }),
  );
  const { data: designsData, isLoading: designsLoading } = useSWR("/marketplace/designs?home", () =>
    getDesigns({ per_page: 8 }),
  );
  const heroCollageRef = useRef<HTMLDivElement>(null);
  const [heroEntered, setHeroEntered] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setHeroEntered(true);
      return;
    }
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setHeroEntered(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, []);

  useEffect(() => {
    const collage = heroCollageRef.current;
    if (!collage) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const layers = Array.from(collage.querySelectorAll<HTMLElement>("[data-hero-layer]"));
    if (layers.length === 0) return;

    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const t = (now - start) / 1000;
      const scrollY = Math.min(window.scrollY, 700);
      const scrollFactor = scrollY / 700;
      layers.forEach((el, i) => {
        const cfg = HERO_MOTION[i] ?? HERO_MOTION[HERO_MOTION.length - 1];
        const floatY = Math.sin(t * cfg.freq + cfg.phase) * cfg.ampY;
        const floatX = Math.cos(t * cfg.freq * 0.8 + cfg.phase) * cfg.ampX;
        const parallaxY = scrollY * cfg.depth;
        const parallaxX = scrollY * cfg.hFactor;
        const scale = 1 + cfg.scaleDelta * scrollFactor;
        el.style.transform = `translate3d(${floatX + parallaxX}px, ${floatY + parallaxY}px, 0) scale(${scale})`;
      });
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="flex flex-col">
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(28deg, #f8fafc 25%, #eef6f3 64%, #e0f1ea 96%)" }}
      >
        <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 items-start gap-6 px-4 py-16 md:px-20 lg:grid-cols-[1fr_475px] xl:grid-cols-[1fr_623px] xl:pr-10 min-[1440px]:grid-cols-[1fr_648px] min-[1440px]:pr-10">
          <div className="flex flex-col items-start gap-7">
            <Reveal delay={0}>
              <h1 className="font-heading text-h3 font-semibold leading-tight text-text-primary md:text-h1 md:leading-[1.1]">
                Wujudkan Ide.
                <br />
                Ciptakan Produk.
                <br />
                <span className="text-accent">Bergerak Bersama.</span>
              </h1>
            </Reveal>
            <Reveal delay={120}>
              <p className="max-w-md font-body text-base text-text-secondary">
                Platform konveksi modern untuk kreator, brand, dan komunitas — custom design, tanpa
                minimum order.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <div className="flex flex-wrap gap-3">
                <Link href="/katalog">
                  <Button variant="primary">Mulai Custom Design →</Button>
                </Link>
                <Link href="/katalog">
                  <Button variant="secondary">Jelajahi Produk</Button>
                </Link>
              </div>
            </Reveal>
            <Reveal delay={360}>
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
            </Reveal>
          </div>

          <div className="hidden overflow-hidden lg:block lg:h-[361px] lg:w-[475px] xl:h-[475px] xl:w-[623px] min-[1440px]:h-[494px] min-[1440px]:w-[648px]">
          <div
            ref={heroCollageRef}
            className="relative h-[526px] w-[690px] origin-top-left scale-[0.6875] xl:scale-[0.9029] min-[1440px]:scale-[0.9391]"
          >
            <div data-hero-layer className="absolute left-[50px] top-[408px] h-[118px] w-[578px]">
              <div className="relative h-full w-full" style={getHeroEntranceStyle(0, heroEntered)}>
                <Image src="/hero/podium-shadow.svg" alt="" fill sizes="578px" priority />
              </div>
            </div>
            <div data-hero-layer className="absolute left-0 top-[293px] h-[223px] w-[690px]">
              <div className="relative h-full w-full" style={getHeroEntranceStyle(1, heroEntered)}>
                <Image
                  src="/hero/podium.png"
                  alt=""
                  fill
                  sizes="690px"
                  className="object-cover drop-shadow-md"
                  priority
                />
              </div>
            </div>
            <div data-hero-layer className="absolute left-[156px] top-[15px] h-[365px] w-[306px]">
              <div className="relative h-full w-full" style={getHeroEntranceStyle(2, heroEntered)}>
                <Image src="/hero/background.png" alt="" fill sizes="306px" className="object-cover" priority />
              </div>
            </div>
            <div
              data-hero-layer
              className="absolute flex items-center justify-center"
              style={{ left: 38, top: 60, width: 302.5, height: 324.2 }}
            >
              <div className="flex h-full w-full items-center justify-center" style={getHeroEntranceStyle(3, heroEntered)}>
                <div className="relative h-[293px] w-[268px] rotate-[-7.2deg] drop-shadow-xl">
                  <Image src="/hero/hoodie.png" alt="Hoodie" fill sizes="268px" className="object-cover" priority />
                </div>
              </div>
            </div>
            <div
              data-hero-layer
              className="absolute flex items-center justify-center"
              style={{ left: 163.8, top: 0, width: 485.4, height: 449.3 }}
            >
              <div className="flex h-full w-full items-center justify-center" style={getHeroEntranceStyle(4, heroEntered)}>
                <div className="relative h-[374px] w-[420px] rotate-[11.37deg] drop-shadow-xl">
                  <Image src="/hero/kaos.png" alt="Kaos" fill sizes="420px" className="object-cover" priority />
                </div>
              </div>
            </div>
            <div data-hero-layer className="absolute left-[16px] top-[110px] h-[57px] w-[58px]">
              <div className="relative h-full w-full" style={getHeroEntranceStyle(5, heroEntered)}>
                <Image src="/hero/benang.png" alt="" fill sizes="58px" className="object-cover drop-shadow-lg" priority />
              </div>
            </div>
            <div
              data-hero-layer
              className="absolute flex items-center justify-center"
              style={{ left: 7, top: 321, width: 61.2, height: 69.3 }}
            >
              <div className="flex h-full w-full items-center justify-center" style={getHeroEntranceStyle(6, heroEntered)}>
                <div className="relative h-[59px] w-[48px] rotate-[-14.66deg] drop-shadow-lg">
                  <Image src="/hero/daun.png" alt="" fill sizes="48px" className="object-cover" priority />
                </div>
              </div>
            </div>
            <div
              data-hero-layer
              className="absolute flex items-center justify-center"
              style={{ left: 537.7, top: 251.6, width: 93.3, height: 73 }}
            >
              <div className="flex h-full w-full items-center justify-center" style={getHeroEntranceStyle(7, heroEntered)}>
                <div className="relative h-[70px] w-[91px] rotate-[1.95deg] drop-shadow-lg">
                  <Image src="/hero/label.png" alt="" fill sizes="91px" className="object-cover" priority />
                </div>
              </div>
            </div>
            <div
              data-hero-layer
              className="absolute flex items-center justify-center"
              style={{ left: 449.6, top: 293.5, width: 148.5, height: 114.6 }}
            >
              <div className="flex h-full w-full items-center justify-center" style={getHeroEntranceStyle(8, heroEntered)}>
                <div className="relative h-[83px] w-[131px] rotate-15 drop-shadow-lg">
                  <Image src="/hero/topi.png" alt="" fill sizes="131px" className="object-cover" priority />
                </div>
              </div>
            </div>

            <div data-hero-layer className="absolute left-[406px] top-[374px]">
              <div
                className="flex w-[180px] flex-col gap-1.5 rounded-md bg-white px-4 py-3 shadow-[0px_8px_24px_0px_rgba(0,0,0,0.18)]"
                style={getHeroEntranceStyle(9, heroEntered)}
              >
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
        </div>
      </section>

      <section className="px-4 py-16 md:px-20">
        <Reveal className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-2">
          <p className="font-body text-caption font-bold uppercase tracking-[0.6px] text-primary">
            Cara Kerja
          </p>
          <h2 className="text-center font-heading text-h3 font-semibold text-text-primary md:text-h2">
            Mudah dalam 4 Langkah
          </h2>
          <div className="mt-6 flex w-full flex-wrap justify-center">
            <div className="relative inline-flex flex-wrap gap-10">
              {[0, 1, 2].map((segment) => (
                <div
                  key={segment}
                  className="absolute top-5 hidden h-0 w-[200px] animate-line-glow border-t-2 border-dashed border-primary opacity-0 md:block"
                  style={{
                    left: `${80 + segment * 200}px`,
                    animationDelay: `${3 * segment + 1.5}s`,
                  }}
                />
              ))}
              {STEPS.map((step, i) => (
                <StepItem key={step.title} number={i + 1} {...step} />
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <section className="px-4 py-16 md:px-20">
        <Reveal className="mx-auto flex w-full max-w-[1440px] flex-col gap-6">
          <div className="flex items-end justify-between">
            <div className="flex flex-col gap-1">
              <p className="font-body text-caption font-bold uppercase tracking-[0.6px] text-primary">
                Produk Populer
              </p>
              <h2 className="font-heading text-h3 font-semibold text-text-primary md:text-h2">
                Beragam Produk, Bebas Berkreasi
              </h2>
            </div>
            <Link href="/katalog" className="shrink-0 font-body text-sm font-medium text-primary transition-colors hover:text-accent hover:underline hover:underline-offset-4">
              Lihat Semua Produk →
            </Link>
          </div>
          {productsLoading && (
            <div className="relative overflow-hidden">
              <div className="flex items-center gap-6 overflow-x-hidden pb-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            </div>
          )}
          {!productsLoading && (productsData?.data ?? []).length === 0 && (
            <p className="font-body text-sm text-text-secondary">Belum ada produk ditemukan.</p>
          )}
          {!productsLoading && (productsData?.data ?? []).length > 0 && (
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
                  className="flex size-11 shrink-0 snap-start items-center justify-center rounded-full border border-border bg-surface text-text-primary transition-all duration-150 hover:-translate-y-0.5 hover:border-primary hover:bg-primary hover:text-text-on-accent hover:shadow-md active:translate-y-0 active:scale-95"
                >
                  <ArrowRight className="size-5" />
                </Link>
                <div className="w-10 shrink-0" aria-hidden="true" />
              </div>
            </div>
          )}
        </Reveal>
      </section>

      <section className="px-4 py-16 md:px-20">
        <Reveal className="mx-auto flex w-full max-w-[1440px] flex-col gap-6">
          <div className="flex items-end justify-between">
            <div className="flex flex-col gap-1">
              <p className="font-body text-caption font-bold uppercase tracking-[0.6px] text-primary">
                Desain Populer
              </p>
              <h2 className="font-heading text-h3 font-semibold text-text-primary md:text-h2">
                Karya Kreator Pilihan
              </h2>
            </div>
            <Link href="/marketplace-desain" className="shrink-0 font-body text-sm font-medium text-primary transition-colors hover:text-accent hover:underline hover:underline-offset-4">
              Lihat Semua Desain →
            </Link>
          </div>
          {designsLoading && (
            <div className="relative overflow-hidden">
              <div className="flex items-center gap-6 overflow-x-hidden pb-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <DesignCardSkeleton key={i} />
                ))}
              </div>
            </div>
          )}
          {!designsLoading && (designsData?.data ?? []).length === 0 && (
            <p className="font-body text-sm text-text-secondary">Belum ada desain ditemukan.</p>
          )}
          {!designsLoading && (designsData?.data ?? []).length > 0 && (
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
                  className="flex size-11 shrink-0 snap-start items-center justify-center rounded-full border border-border bg-surface text-text-primary transition-all duration-150 hover:-translate-y-0.5 hover:border-primary hover:bg-primary hover:text-text-on-accent hover:shadow-md active:translate-y-0 active:scale-95"
                >
                  <ArrowRight className="size-5" />
                </Link>
                <div className="w-10 shrink-0" aria-hidden="true" />
              </div>
            </div>
          )}
        </Reveal>
      </section>

      <section className="py-16">
        <Reveal className="flex w-full flex-col items-center gap-2">
          <p className="font-body text-caption font-bold uppercase tracking-[0.6px] text-primary">
            Apa Kata Mereka
          </p>
          <h2 className="text-center font-heading text-h3 font-semibold text-text-primary md:text-h2">
            Dipercaya Banyak Kreator & Brand
          </h2>
          <div className="mx-auto w-full max-w-[1440px] overflow-hidden px-4 [mask-image:linear-gradient(to_right,transparent_0%,black_5%,black_95%,transparent_100%)] md:px-20">
            <div className="flex w-max animate-marquee gap-6 hover:[animation-play-state:paused]">
              {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
                <TestimonialCard key={`${t.name}-${i}`} {...t} />
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <section className="px-4 py-16 md:px-20">
        <Reveal className="mx-auto flex w-full max-w-[1440px] flex-col items-start justify-between gap-6 rounded-lg bg-primary px-8 py-10 md:flex-row md:items-center">
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
        </Reveal>
      </section>
    </div>
  );
}
