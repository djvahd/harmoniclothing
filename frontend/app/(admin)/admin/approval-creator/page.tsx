"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import AdminSidebar from "@/components/layout/AdminSidebar";
import SidebarPageShell from "@/components/layout/SidebarPageShell";
import Button from "@/components/ui/Button";
import PromptModal from "@/components/ui/PromptModal";
import { approveCreator, getPendingCreators, rejectCreator } from "@/services/admin";

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
            <div key={creator.id} className="flex items-center justify-between rounded-md border border-border bg-surface p-4">
              <div className="flex flex-col">
                <p className="font-body text-sm font-semibold text-text-primary">
                  {creator.user.name}
                </p>
                <p className="font-body text-xs text-text-secondary">
                  {creator.user.email} · KTP: {creator.kyc_id_number}
                </p>
              </div>
              <div className="flex gap-2">
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
