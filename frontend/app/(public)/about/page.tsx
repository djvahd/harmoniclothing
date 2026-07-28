"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Award,
  Compass,
  Eye,
  Globe,
  Heart,
  Lightbulb,
  MapPin,
  Package,
  Palette,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  UploadCloud,
  Users,
  Wallet,
} from "lucide-react";
import FeatureCard from "@/components/ui/FeatureCard";
import StepItem from "@/components/ui/StepItem";
import TestimonialCard from "@/components/ui/TestimonialCard";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import { useAuthModalStore } from "@/store/auth-modal-store";

const REASONS = [
  { icon: Sparkles, title: "Custom Tanpa Batas", description: "Desain sendiri atau pilih dari Lapak Desain, produk tetap terasa milikmu." },
  { icon: Award, title: "Kualitas Terjamin", description: "Bahan premium dan proses produksi terstandar di setiap pesanan." },
  { icon: Palette, title: "Wadah Kreator Lokal", description: "Kreator bisa upload desain dan dapat komisi dari tiap penjualan." },
  { icon: ShieldCheck, title: "Transaksi Aman", description: "Pembayaran terverifikasi dan status pesanan transparan." },
  { icon: Heart, title: "Layanan Personal", description: "Tim kami siap bantu lewat live chat untuk setiap kendala." },
];

const VALUES = [
  { icon: Award, title: "Kualitas", description: "Setiap produk melewati standar kontrol kualitas yang ketat sebelum dikirim." },
  { icon: Lightbulb, title: "Kreativitas", description: "Kami percaya setiap ide punya nilai dan layak untuk diwujudkan." },
  { icon: Users, title: "Komunitas", description: "Kreator dan pelanggan adalah bagian dari keluarga besar Harmoni." },
  { icon: Eye, title: "Transparansi", description: "Harga, status pesanan, dan komisi kreator selalu jelas dan terbuka." },
];

const STATS = [
  { icon: Package, value: "10.000+", label: "Produk Terkirim" },
  { icon: Users, value: "500+", label: "Kreator Aktif" },
  { icon: Palette, value: "5.000+", label: "Desain Tersedia" },
  { icon: Star, value: "4.9/5", label: "Rating Kepuasan" },
  { icon: MapPin, value: "34", label: "Provinsi Terjangkau" },
];

const CREATOR_BENEFITS = [
  { icon: UploadCloud, label: "Upload Mudah" },
  { icon: Wallet, label: "Komisi Transparan" },
  { icon: Globe, label: "Jangkauan Nasional" },
];

const TIMELINE = [
  { year: "2023", title: "Harmoni Dimulai", description: "Berawal dari kebutuhan konveksi custom yang cepat dan terpercaya." },
  { year: "2024", title: "Lapak Desain Diluncurkan", description: "Membuka ruang bagi kreator lokal untuk memasarkan karyanya." },
  { year: "2026", title: "Platform Digital Penuh", description: "Seluruh proses, dari desain hingga pengiriman, kini bisa dilakukan online." },
];

const TESTIMONIALS = [
  { quote: "Sebagai kreator, royalti dari desain yang kejual kelihatan jelas di dashboard.", name: "Bella Anastasya", role: "Kreator Desain", rating: 5 },
  { quote: "Tim CS-nya responsif, bikin tenang order custom dalam jumlah besar.", name: "Fajar Nugroho", role: "Ketua Komunitas Motor", rating: 5 },
  { quote: "Kualitas sablon dan bahan konsisten dari order pertama sampai sekarang.", name: "Dimas Alfarizi", role: "Founder Local Brand", rating: 5 },
  { quote: "Proses gabung jadi kreator gampang, dan support timnya cepat tanggap.", name: "Nadia Kirana", role: "Content Creator", rating: 4 },
];

export default function TentangKamiPage() {
  const openAuthModal = useAuthModalStore((state) => state.open);
  return (
    <div className="flex flex-col">
      <section
        className="relative overflow-hidden px-4 py-16 md:px-20"
        style={{
          background:
            "linear-gradient(to bottom, transparent 85%, #f8fafc 100%), linear-gradient(28deg, #f8fafc 25%, #eef6f3 64%, #e0f1ea 96%)",
        }}
      >
        <Reveal className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-8 text-center lg:flex-row lg:items-center lg:justify-between lg:text-left">
          <div className="flex max-w-2xl flex-col items-center gap-4 lg:items-start">
            <h1 className="font-heading text-h3 font-semibold text-text-primary md:text-h1">
              Tentang Harmoni Clothing
            </h1>
            <p className="font-body text-base text-text-secondary">
              Platform konveksi modern yang menghubungkan brand, individu, dan kreator lokal untuk
              menciptakan apparel yang benar-benar sesuai gaya masing-masing.
            </p>
          </div>
          <div className="relative h-[180px] w-[210px] shrink-0 sm:h-[220px] sm:w-[255px] lg:h-[260px] lg:w-[300px]">
            <div className="absolute left-1/2 top-0 h-[152px] w-[137px] -translate-x-1/2 rotate-[-6deg] sm:h-[186px] sm:w-[167px] lg:h-[220px] lg:w-[196px]">
              <Image
                src="/hero/kaos.png"
                alt="Kaos custom Harmoni Clothing"
                fill
                sizes="196px"
                className="object-contain drop-shadow-xl"
                priority
              />
            </div>
            <div className="absolute bottom-2 left-0 h-[76px] w-[90px] rotate-[10deg] sm:h-[93px] sm:w-[110px] lg:h-[110px] lg:w-[130px]">
              <Image
                src="/hero/topi.png"
                alt="Topi custom Harmoni Clothing"
                fill
                sizes="130px"
                className="object-contain drop-shadow-lg"
              />
            </div>
            <div className="absolute right-0 top-6 h-[42px] w-[36px] rotate-[-12deg] sm:h-[51px] sm:w-[44px] lg:h-[60px] lg:w-[52px]">
              <Image src="/hero/daun.png" alt="" fill sizes="52px" className="object-contain drop-shadow-lg" />
            </div>
          </div>
        </Reveal>
      </section>

      <section className="px-4 py-16 md:px-20">
        <Reveal className="mx-auto flex w-full max-w-[1440px] flex-col gap-10">
          <div className="flex flex-col items-center gap-2">
            <p className="font-body text-caption font-bold uppercase tracking-[0.6px] text-primary">
              Visi & Misi
            </p>
            <h2 className="text-center font-heading text-h3 font-semibold text-text-primary md:text-h2">
              Yang Kami Perjuangkan
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-6">
              <span className="flex size-10 items-center justify-center rounded-md bg-primary">
                <Compass className="size-5 text-text-on-accent" />
              </span>
              <h3 className="font-heading text-lg font-semibold text-text-primary">Visi</h3>
              <p className="font-body text-sm text-text-secondary">
                Menjadi platform konveksi custom terpercaya nomor satu di Indonesia yang memberdayakan
                setiap individu dan kreator lokal untuk mewujudkan ide menjadi produk nyata.
              </p>
            </div>
            <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-6">
              <span className="flex size-10 items-center justify-center rounded-md bg-accent">
                <Target className="size-5 text-text-on-accent" />
              </span>
              <h3 className="font-heading text-lg font-semibold text-text-primary">Misi</h3>
              <ul className="flex flex-col gap-2 font-body text-sm text-text-secondary">
                <li>Menyediakan layanan custom apparel berkualitas tinggi tanpa minimum order.</li>
                <li>Membuka ruang bagi kreator lokal untuk berkarya dan mendapat penghasilan.</li>
                <li>Menghadirkan proses pemesanan yang transparan, cepat, dan mudah diakses di seluruh Indonesia.</li>
                <li>Membangun komunitas kreatif yang saling mendukung.</li>
              </ul>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="bg-surface px-4 py-16 md:px-20">
        <Reveal className="mx-auto flex w-full max-w-[1440px] flex-col gap-8">
          <div className="flex flex-col items-center gap-2">
            <p className="font-body text-caption font-bold uppercase tracking-[0.6px] text-primary">
              Kenapa Harmoni
            </p>
            <h2 className="text-center font-heading text-h3 font-semibold text-text-primary md:text-h2">
              Kenapa Memilih Harmoni?
            </h2>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {REASONS.map((r) => (
              <FeatureCard key={r.title} {...r} />
            ))}
          </div>
        </Reveal>
      </section>

      <section className="px-4 py-16 md:px-20">
        <Reveal className="mx-auto flex w-full max-w-[1440px] flex-col gap-10">
          <div className="flex flex-col items-center gap-2">
            <p className="font-body text-caption font-bold uppercase tracking-[0.6px] text-primary">
              Nilai Kami
            </p>
            <h2 className="text-center font-heading text-h3 font-semibold text-text-primary md:text-h2">
              Prinsip di Balik Setiap Produk
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {VALUES.map((v) => (
              <div key={v.title} className="flex flex-col items-center gap-2 text-center">
                <span className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                  <v.icon className="size-5 text-primary" />
                </span>
                <p className="font-heading text-sm font-semibold text-text-primary">{v.title}</p>
                <p className="font-body text-xs text-text-secondary">{v.description}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="bg-surface px-4 py-16 md:px-20">
        <Reveal className="mx-auto flex w-full max-w-[1440px] flex-wrap justify-center gap-10">
          {STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-accent/10">
                <stat.icon className="size-5 text-accent" />
              </span>
              <p className="font-heading text-2xl font-semibold text-text-primary">{stat.value}</p>
              <p className="font-body text-xs text-text-secondary">{stat.label}</p>
            </div>
          ))}
        </Reveal>
      </section>

      <section className="px-4 py-16 md:px-20">
        <Reveal className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-6 rounded-lg bg-accent/10 px-8 py-12 text-center md:flex-row md:items-center md:justify-between md:text-left">
          <div className="flex max-w-xl flex-col gap-3">
            <p className="font-body text-caption font-bold uppercase tracking-[0.6px] text-accent">
              Lapak Desain
            </p>
            <h2 className="font-heading text-h3 font-semibold text-text-primary md:text-h2">
              Untuk Kreator Lokal
            </h2>
            <p className="font-body text-sm text-text-secondary">
              Punya desain keren? Upload di Lapak Desain dan dapatkan komisi dari setiap penjualan.
              Karyamu, penghasilanmu.
            </p>
            <div className="flex flex-wrap justify-center gap-5 pt-1 md:justify-start">
              {CREATOR_BENEFITS.map((b) => (
                <div key={b.label} className="flex items-center gap-2">
                  <b.icon className="size-4 text-accent" />
                  <span className="font-body text-xs font-semibold text-text-primary">{b.label}</span>
                </div>
              ))}
            </div>
          </div>
          <Link href="/account/become-creator" className="shrink-0">
            <Button variant="primary">Jadi Kreator →</Button>
          </Link>
        </Reveal>
      </section>

      <section className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-16 md:px-20">
        <Reveal className="flex flex-col gap-8">
          <h2 className="text-center font-heading text-h3 font-semibold text-text-primary md:text-h2">
            Cerita Harmoni
          </h2>
          <div className="flex flex-col gap-6">
            {TIMELINE.map((t) => (
              <div key={t.year} className="flex gap-4">
                <p className="w-16 shrink-0 font-heading text-lg font-semibold text-primary">
                  {t.year}
                </p>
                <div className="flex flex-col gap-1 border-l border-border pl-4">
                  <p className="font-body text-sm font-semibold text-text-primary">{t.title}</p>
                  <p className="font-body text-sm text-text-secondary">{t.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="bg-surface px-4 py-16 md:px-20">
        <Reveal className="mx-auto flex w-full max-w-[1440px] flex-col gap-8">
          <h2 className="text-center font-heading text-h3 font-semibold text-text-primary md:text-h2">
            Proses Kami
          </h2>
          <div className="flex flex-wrap justify-center gap-10">
            <StepItem number={1} icon={Palette} title="Desain" description="Custom sendiri atau pilih dari Lapak Desain" />
            <StepItem number={2} icon={Award} title="Produksi" description="Diproduksi dengan bahan dan sablon premium" />
            <StepItem number={3} icon={ShieldCheck} title="Quality Check" description="Setiap produk dicek sebelum dikirim" />
            <StepItem number={4} icon={Heart} title="Sampai ke Kamu" description="Dikirim ke seluruh Indonesia" />
          </div>
        </Reveal>
      </section>

      <section className="px-4 py-16 md:px-20">
        <Reveal className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-8">
          <div className="flex flex-col items-center gap-2">
            <p className="font-body text-caption font-bold uppercase tracking-[0.6px] text-primary">
              Apa Kata Mereka
            </p>
            <h2 className="text-center font-heading text-h3 font-semibold text-text-primary md:text-h2">
              Dipercaya Pelanggan & Kreator
            </h2>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {TESTIMONIALS.map((t) => (
              <TestimonialCard key={t.name} {...t} />
            ))}
          </div>
        </Reveal>
      </section>

      <section className="px-4 py-16 md:px-20">
        <Reveal className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-5 rounded-lg bg-primary px-8 py-14 text-center">
          <h2 className="font-heading text-h3 font-semibold text-text-on-accent md:text-h2">
            Mari Wujudkan Desainmu Bersama Kami
          </h2>
          <Button variant="primary" onClick={() => openAuthModal("register")}>
            Daftar Gratis
          </Button>
        </Reveal>
      </section>
    </div>
  );
}
