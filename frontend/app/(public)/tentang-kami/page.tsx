import Link from "next/link";
import Image from "next/image";
import { Award, Heart, MapPin, Package, Palette, ShieldCheck, Sparkles, Star, Users } from "lucide-react";
import FeatureCard from "@/components/ui/FeatureCard";
import StepItem from "@/components/ui/StepItem";
import Button from "@/components/ui/Button";

const REASONS = [
  { icon: Sparkles, title: "Custom Tanpa Batas", description: "Desain sendiri atau pilih dari Lapak Desain, produk tetap terasa milikmu." },
  { icon: Award, title: "Kualitas Terjamin", description: "Bahan premium dan proses produksi terstandar di setiap pesanan." },
  { icon: Palette, title: "Wadah Kreator Lokal", description: "Kreator bisa upload desain dan dapat komisi dari tiap penjualan." },
  { icon: ShieldCheck, title: "Transaksi Aman", description: "Pembayaran terverifikasi dan status pesanan transparan." },
  { icon: Heart, title: "Layanan Personal", description: "Tim kami siap bantu lewat live chat untuk setiap kendala." },
];

const STATS = [
  { icon: Package, value: "10.000+", label: "Produk Terkirim" },
  { icon: Users, value: "500+", label: "Kreator Aktif" },
  { icon: Palette, value: "5.000+", label: "Desain Tersedia" },
  { icon: Star, value: "4.9/5", label: "Rating Kepuasan" },
  { icon: MapPin, value: "34", label: "Provinsi Terjangkau" },
];

const TIMELINE = [
  { year: "2023", title: "Harmoni Dimulai", description: "Berawal dari kebutuhan konveksi custom yang cepat dan terpercaya." },
  { year: "2024", title: "Lapak Desain Diluncurkan", description: "Membuka ruang bagi kreator lokal untuk memasarkan karyanya." },
  { year: "2026", title: "Platform Digital Penuh", description: "Seluruh proses, dari desain hingga pengiriman, kini bisa dilakukan online." },
];

export default function TentangKamiPage() {
  return (
    <div className="flex flex-col">
      <section
        className="relative overflow-hidden px-4 py-16 md:px-20"
        style={{
          background:
            "linear-gradient(to bottom, transparent 85%, #f8fafc 100%), linear-gradient(28deg, #f8fafc 25%, #eef6f3 64%, #e0f1ea 96%)",
        }}
      >
        <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-8 text-center lg:flex-row lg:items-center lg:justify-between lg:text-left">
          <div className="flex max-w-2xl flex-col items-center gap-4 lg:items-start">
            <h1 className="font-heading text-h3 font-semibold text-text-primary md:text-h1">
              Tentang Harmoni Clothing
            </h1>
            <p className="font-body text-base text-text-secondary">
              Platform konveksi modern yang menghubungkan brand, individu, dan kreator lokal untuk
              menciptakan apparel yang benar-benar sesuai gaya masing-masing.
            </p>
          </div>
          <div className="relative hidden h-[260px] w-[300px] shrink-0 lg:block">
            <div className="absolute left-1/2 top-0 h-[220px] w-[196px] -translate-x-1/2 rotate-[-6deg]">
              <Image
                src="/hero/kaos.png"
                alt="Kaos custom Harmoni Clothing"
                fill
                sizes="196px"
                className="object-contain drop-shadow-xl"
                priority
              />
            </div>
            <div className="absolute bottom-2 left-0 h-[110px] w-[130px] rotate-[10deg]">
              <Image
                src="/hero/topi.png"
                alt="Topi custom Harmoni Clothing"
                fill
                sizes="130px"
                className="object-contain drop-shadow-lg"
              />
            </div>
            <div className="absolute right-0 top-6 h-[60px] w-[52px] rotate-[-12deg]">
              <Image src="/hero/daun.png" alt="" fill sizes="52px" className="object-contain drop-shadow-lg" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-4 py-16 md:px-20">
        <h2 className="text-center font-heading text-h3 font-semibold text-text-primary md:text-h2">
          Kenapa Memilih Harmoni?
        </h2>
        <div className="flex flex-wrap justify-center gap-6">
          {REASONS.map((r) => (
            <FeatureCard key={r.title} {...r} />
          ))}
        </div>
      </section>

      <section className="bg-surface px-4 py-16 md:px-20">
        <div className="mx-auto flex w-full max-w-[1440px] flex-wrap justify-center gap-10">
          {STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-accent/10">
                <stat.icon className="size-5 text-accent" />
              </span>
              <p className="font-heading text-2xl font-semibold text-text-primary">{stat.value}</p>
              <p className="font-body text-xs text-text-secondary">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-16 md:px-20">
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
      </section>

      <section className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-4 py-16 md:px-20">
        <h2 className="text-center font-heading text-h3 font-semibold text-text-primary md:text-h2">
          Proses Kami
        </h2>
        <div className="flex flex-wrap justify-center gap-10">
          <StepItem number={1} icon={Palette} title="Desain" description="Custom sendiri atau pilih dari Lapak Desain" />
          <StepItem number={2} icon={Award} title="Produksi" description="Diproduksi dengan bahan dan sablon premium" />
          <StepItem number={3} icon={ShieldCheck} title="Quality Check" description="Setiap produk dicek sebelum dikirim" />
          <StepItem number={4} icon={Heart} title="Sampai ke Kamu" description="Dikirim ke seluruh Indonesia" />
        </div>
      </section>

      <section className="px-4 py-16 md:px-20">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-5 rounded-lg bg-primary px-8 py-14 text-center">
          <h2 className="font-heading text-h3 font-semibold text-text-on-accent md:text-h2">
            Mari Wujudkan Desainmu Bersama Kami
          </h2>
          <Link href="/register">
            <Button variant="primary">Daftar Gratis</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
