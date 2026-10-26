"use client";

import { useState } from "react";
import Image from "next/image";
import useSWR, { mutate } from "swr";
import { Palette } from "lucide-react";
import { useTranslations } from "next-intl";
import AdminSidebar from "@/components/layout/AdminSidebar";
import SidebarPageShell from "@/components/layout/SidebarPageShell";
import Button from "@/components/ui/Button";
import PromptModal from "@/components/ui/PromptModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import { toast } from "@/store/toast-store";
import { approveDesign, getPendingDesigns, rejectDesign } from "@/services/admin";
import { storageUrl } from "@/lib/storage";

export default function ApprovalDesainPage() {
  const t = useTranslations("admin.designApproval");
  const tCommon = useTranslations("common");
  const { data, isLoading } = useSWR("/admin/designs/pending", getPendingDesigns);
  const designs = data?.data ?? [];
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [approving, setApproving] = useState<{ id: number; title: string } | null>(null);

  async function handleApprove() {
    if (!approving) return;
    const id = approving.id;
    setApproving(null);
    setLoadingId(id);
    try {
      await approveDesign(id);
      mutate("/admin/designs/pending");
      toast(t("approveSuccess"), "success");
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
      toast(t("rejectSuccess"), "success");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <SidebarPageShell sidebar={<AdminSidebar />}>
      <div className="flex flex-col gap-6">
        <h1 className="font-heading text-h3 font-semibold text-text-primary">
          {t("title")}
        </h1>
        {isLoading && <LoadingState rows={3} />}
        {!isLoading && designs.length === 0 && (
          <EmptyState icon={Palette} title={t("empty")} />
        )}
        <div className="flex flex-col gap-3">
          {designs.map((design) => {
            const thumbnail = storageUrl(design.thumbnail_path);
            return (
              <div key={design.id} className="flex flex-col gap-3 rounded-md border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-sm bg-border">
                    {thumbnail && (
                      <Image src={thumbnail} alt={design.title} fill className="object-cover" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <p className="font-body text-sm font-semibold text-text-primary">{design.title}</p>
                    <p className="font-body text-xs text-text-secondary">
                      {t("byCreator", { name: design.creator.name })}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button variant="secondary" loading={loadingId === design.id} onClick={() => setRejectingId(design.id)}>
                    {t("reject")}
                  </Button>
                  <Button loading={loadingId === design.id} onClick={() => setApproving({ id: design.id, title: design.title })}>
                    {t("approve")}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <ConfirmDialog
        open={approving !== null}
        title={t("approveConfirmTitle")}
        message={t("approveConfirmMessage", { name: approving?.title ?? "" })}
        confirmLabel={t("approve")}
        cancelLabel={tCommon("cancel")}
        onConfirm={handleApprove}
        onCancel={() => setApproving(null)}
      />
      <PromptModal
        open={rejectingId !== null}
        title={t("rejectModal.title")}
        label={t("rejectModal.label")}
        minLength={10}
        confirmLabel={t("reject")}
        onConfirm={handleReject}
        onCancel={() => setRejectingId(null)}
      />
    </SidebarPageShell>
  );
}
