"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Award, Palette, Wallet } from "lucide-react";
import AccountSidebar from "@/components/layout/AccountSidebar";
import SidebarPageShell from "@/components/layout/SidebarPageShell";
import FeatureCard from "@/components/ui/FeatureCard";
import Button from "@/components/ui/Button";
import { becomeCreator } from "@/services/creator";
import { ApiError } from "@/lib/api";

export default function AjukanUpgradeCreatorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleApply() {
    setLoading(true);
    setError(null);
    try {
      await becomeCreator();
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
        <h1 className="font-heading text-2xl font-semibold text-text-primary">
          Ajukan Upgrade Creator
        </h1>
        <p className="font-body text-sm text-text-secondary">
          Jadi Kreator di Harmoni Clothing dan dapatkan komisi dari setiap penjualan desainmu.
        </p>

        <div className="flex flex-wrap gap-4">
          <FeatureCard icon={Palette} title="Upload Desain Bebas" description="Unggah karya orisinalmu kapan saja." />
          <FeatureCard icon={Award} title="Terpajang di Marketplace" description="Desainmu bisa ditemukan pembeli di seluruh Indonesia." />
          <FeatureCard icon={Wallet} title="Komisi Otomatis" description="Dapatkan komisi setiap desainmu terjual." />
        </div>

        {error && <p className="font-body text-xs text-red-500">{error}</p>}
        <Button loading={loading} onClick={handleApply}>
          Ajukan Sekarang
        </Button>
        <p className="font-body text-xs text-text-secondary">
          Setelah pengajuan, kamu akan diarahkan untuk melengkapi verifikasi identitas sebelum
          akun Kreator diaktifkan oleh tim kami.
        </p>
      </div>
    </SidebarPageShell>
  );
}
