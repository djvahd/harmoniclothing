"use client";

import { useState } from "react";
import CreatorSidebar from "@/components/layout/CreatorSidebar";
import SidebarPageShell from "@/components/layout/SidebarPageShell";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { submitVerification } from "@/services/creator";
import { ApiError } from "@/lib/api";

export default function VerifikasiDataDiriPage() {
  const [fullName, setFullName] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data } = await submitVerification({
        kyc_full_name: fullName,
        kyc_id_number: idNumber,
      });
      setStatus(data.status);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Terjadi kesalahan, coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SidebarPageShell sidebar={<CreatorSidebar />}>
      <div className="flex max-w-lg flex-col gap-6">
        <h1 className="font-heading text-2xl font-semibold text-text-primary">
          Verifikasi Data Diri
        </h1>
        {status && (
          <div className="flex items-center gap-2">
            <span className="font-body text-sm text-text-secondary">Status:</span>
            <Badge variant={status === "aktif" ? "success" : "warning"}>
              {status === "menunggu_approval" ? "Menunggu Review" : status}
            </Badge>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-md border border-border bg-surface p-5">
          <Input label="Nama Lengkap (sesuai KTP)" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          <Input label="Nomor KTP" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} required />
          {error && <p className="font-body text-xs text-red-500">{error}</p>}
          <Button type="submit" loading={loading}>
            Kirim Verifikasi
          </Button>
        </form>
        <p className="font-body text-xs text-text-secondary">
          Tim kami akan meninjau datamu dan mengaktifkan akun Kreator dalam 1-3 hari kerja.
        </p>
      </div>
    </SidebarPageShell>
  );
}
