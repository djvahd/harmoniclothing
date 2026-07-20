"use client";

import { useState } from "react";
import Image from "next/image";
import useSWR, { mutate } from "swr";
import AdminSidebar from "@/components/layout/AdminSidebar";
import SidebarPageShell from "@/components/layout/SidebarPageShell";
import Button from "@/components/ui/Button";
import PromptModal from "@/components/ui/PromptModal";
import { approveDesign, getPendingDesigns, rejectDesign } from "@/services/admin";
import { storageUrl } from "@/lib/storage";

export default function ApprovalDesainPage() {
  const { data, isLoading } = useSWR("/admin/designs/pending", getPendingDesigns);
  const designs = data?.data ?? [];
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [rejectingId, setRejectingId] = useState<number | null>(null);

  async function handleApprove(id: number) {
    setLoadingId(id);
    try {
      await approveDesign(id);
      mutate("/admin/designs/pending");
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
      await rejectDesign(id, reason);
      mutate("/admin/designs/pending");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <SidebarPageShell sidebar={<AdminSidebar />}>
      <div className="flex flex-col gap-6">
        <h1 className="font-heading text-2xl font-semibold text-text-primary">
          Approval Desain
        </h1>
        {isLoading && <p className="font-body text-sm text-text-secondary">Memuat...</p>}
        {!isLoading && designs.length === 0 && (
          <p className="font-body text-sm text-text-secondary">
            Tidak ada desain menunggu review.
          </p>
        )}
        <div className="flex flex-col gap-3">
          {designs.map((design) => {
            const thumbnail = storageUrl(design.thumbnail_path);
            return (
              <div key={design.id} className="flex items-center justify-between rounded-md border border-border bg-surface p-4">
                <div className="flex items-center gap-3">
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-sm bg-border">
                    {thumbnail && (
                      <Image src={thumbnail} alt={design.title} fill className="object-cover" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <p className="font-body text-sm font-semibold text-text-primary">{design.title}</p>
                    <p className="font-body text-xs text-text-secondary">by {design.creator.name}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" loading={loadingId === design.id} onClick={() => setRejectingId(design.id)}>
                    Tolak
                  </Button>
                  <Button loading={loadingId === design.id} onClick={() => handleApprove(design.id)}>
                    Setujui
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <PromptModal
        open={rejectingId !== null}
        title="Tolak Desain"
        label="Alasan penolakan"
        minLength={10}
        confirmLabel="Tolak"
        onConfirm={handleReject}
        onCancel={() => setRejectingId(null)}
      />
    </SidebarPageShell>
  );
}
