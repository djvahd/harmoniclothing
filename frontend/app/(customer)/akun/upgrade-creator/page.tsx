"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Award, Palette, Wallet } from "lucide-react";
import AccountSidebar from "@/components/layout/AccountSidebar";
import SidebarPageShell from "@/components/layout/SidebarPageShell";
import FeatureCard from "@/components/ui/FeatureCard";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { becomeCreator } from "@/services/creator";
import { ApiError } from "@/lib/api";

export default function AjukanUpgradeCreatorPage() {
  const router = useRouter();
  const [brandName, setBrandName] = useState("");
  const [bio, setBio] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await becomeCreator({
        terms_accepted: termsAccepted,
        brand_name: brandName || undefined,
        bio: bio || undefined,
        portfolio_url: portfolioUrl || undefined,
      });
      router.push("/creator/verifikasi");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Terjadi kesalahan, coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SidebarPageShell sidebar={<AccountSidebar />}>
      <div className="flex max-w-2xl flex-col gap-6">
        <h1 className="font-heading text-h3 font-semibold text-text-primary">
          Ajukan Upgrade Creator
        </h1>
        <p className="font-body text-sm text-text-secondary">
          Jadi Kreator di Harmoni Clothing dan dapatkan komisi dari setiap penjualan desainmu.
        </p>

        <div className="flex flex-wrap gap-4">
          <FeatureCard icon={Palette} title="Upload Desain Bebas" description="Unggah karya orisinalmu kapan saja." />
          <FeatureCard icon={Award} title="Terpajang di Lapak Desain" description="Desainmu bisa ditemukan pembeli di seluruh Indonesia." />
          <FeatureCard icon={Wallet} title="Komisi Otomatis" description="Dapatkan komisi setiap desainmu terjual." />
        </div>

        <form onSubmit={handleApply} className="flex flex-col gap-4 rounded-md border border-border bg-surface p-5">
          <Input
            label="Nama Brand/Toko (opsional)"
            placeholder="Contoh: Studio Rangga"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
          />
          <div className="flex flex-col gap-1.5">
            <label className="font-body text-xs font-medium text-text-secondary">Bio Singkat (opsional)</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Ceritakan singkat tentang dirimu sebagai Creator."
              className="w-full rounded-sm border border-border bg-surface px-3 py-2.5 font-body text-sm text-text-primary outline-none"
            />
          </div>
          <Input
            label="Link Portfolio/Sosial Media (opsional)"
            placeholder="https://instagram.com/namamu"
            type="url"
            value={portfolioUrl}
            onChange={(e) => setPortfolioUrl(e.target.value)}
          />

          <label className="flex items-start gap-2 font-body text-xs text-text-secondary">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-0.5"
              required
            />
            Saya menyetujui Syarat & Ketentuan Creator (komisi dan kebijakan konten desain).
          </label>

          {error && <p className="font-body text-xs text-red-500">{error}</p>}
          <Button type="submit" loading={loading}>
            Ajukan Sekarang
          </Button>
        </form>
        <p className="font-body text-xs text-text-secondary">
          Setelah pengajuan, kamu akan diarahkan untuk melengkapi verifikasi identitas sebelum
          akun Kreator diaktifkan oleh tim kami.
        </p>
      </div>
    </SidebarPageShell>
  );
}
