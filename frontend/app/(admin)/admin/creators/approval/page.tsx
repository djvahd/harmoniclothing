"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import AdminSidebar from "@/components/layout/AdminSidebar";
import SidebarPageShell from "@/components/layout/SidebarPageShell";
import Button from "@/components/ui/Button";
import PromptModal from "@/components/ui/PromptModal";
import { formatDate } from "@/lib/format";
import { approveCreator, getPendingCreators, kycDocumentUrl, rejectCreator } from "@/services/admin";

export default function ApprovalCreatorPage() {
  const { data, isLoading } = useSWR("/admin/creators/pending", getPendingCreators);
  const creators = data?.data ?? [];
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [rejectingId, setRejectingId] = useState<number | null>(null);

  async function handleApprove(id: number) {
    setLoadingId(id);
    try {
      await approveCreator(id);
      mutate("/admin/creators/pending");
    } finally {
      setLoadingId(null);
    }
  }

  async function handleReject(reason: string) {
    if (rejectingId === null) return;
    const id = rejectingId;
    setRejectingId(null);
    setLoadingId(id);
    try {
      await rejectCreator(id, reason);
      mutate("/admin/creators/pending");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <SidebarPageShell sidebar={<AdminSidebar />}>
      <div className="flex flex-col gap-6">
        <h1 className="font-heading text-h3 font-semibold text-text-primary">
          Approval Creator
        </h1>
        {isLoading && <p className="font-body text-sm text-text-secondary">Memuat...</p>}
        {!isLoading && creators.length === 0 && (
          <p className="font-body text-sm text-text-secondary">
            Tidak ada pengajuan creator menunggu review.
          </p>
        )}
        <div className="flex flex-col gap-3">
          {creators.map((creator) => (
            <div key={creator.id} className="flex flex-col gap-3 rounded-md border border-border bg-surface p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <p className="font-body text-sm font-semibold text-text-primary">
                    {creator.brand_name ?? creator.user.name}
                    {creator.is_minor && (
                      <span className="ml-2 rounded-full bg-accent/10 px-2 py-0.5 font-body text-[10px] font-medium text-accent">
                        Di bawah 18 tahun
                      </span>
                    )}
                  </p>
                  <p className="font-body text-xs text-text-secondary">
                    {creator.user.email} · {creator.kyc_full_name} · KTP: {creator.kyc_id_number}
                    {creator.birth_date && ` · Lahir: ${formatDate(creator.birth_date)}`}
                  </p>
                  {creator.address && (
                    <p className="font-body text-xs text-text-secondary">Alamat: {creator.address}</p>
                  )}
                  {creator.payout_method && (
                    <p className="font-body text-xs text-text-secondary">
                      Pencairan: {creator.payout_method} · {creator.payout_account_number} a.n. {creator.payout_account_holder}
                    </p>
                  )}
                  {creator.is_minor && creator.guardian_name && (
                    <p className="font-body text-xs text-text-secondary">
                      Wali: {creator.guardian_name} · KTP: {creator.guardian_id_number}
                    </p>
                  )}
                  {creator.has_ktp_photo && (
                    <a
                      href={kycDocumentUrl(creator.id)}
                      target="_blank"
                      rel="noreferrer"
                      className="font-body text-xs font-medium text-primary underline"
                    >
                      Lihat Foto KTP
                    </a>
                  )}
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    variant="secondary"
                    loading={loadingId === creator.id}
                    onClick={() => setRejectingId(creator.id)}
                  >
                    Tolak
                  </Button>
                  <Button loading={loadingId === creator.id} onClick={() => handleApprove(creator.id)}>
                    Setujui
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <PromptModal
        open={rejectingId !== null}
        title="Tolak Pengajuan Creator"
        label="Alasan penolakan"
        minLength={10}
        confirmLabel="Tolak"
        onConfirm={handleReject}
        onCancel={() => setRejectingId(null)}
      />
    </SidebarPageShell>
  );
}
