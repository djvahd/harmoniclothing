"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { UserCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import AdminSidebar from "@/components/layout/AdminSidebar";
import SidebarPageShell from "@/components/layout/SidebarPageShell";
import Button from "@/components/ui/Button";
import PromptModal from "@/components/ui/PromptModal";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import { toast } from "@/store/toast-store";
import { formatDate } from "@/lib/format";
import { approveCreator, getPendingCreators, kycDocumentUrl, rejectCreator } from "@/services/admin";

export default function ApprovalCreatorPage() {
  const t = useTranslations("admin.creatorApproval");
  const { data, isLoading } = useSWR("/admin/creators/pending", getPendingCreators);
  const creators = data?.data ?? [];
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [rejectingId, setRejectingId] = useState<number | null>(null);

  async function handleApprove(id: number) {
    setLoadingId(id);
    try {
      await approveCreator(id);
      mutate("/admin/creators/pending");
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
      await rejectCreator(id, reason);
      mutate("/admin/creators/pending");
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
        {!isLoading && creators.length === 0 && (
          <EmptyState icon={UserCheck} title={t("empty")} />
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
                        {t("minorBadge")}
                      </span>
                    )}
                  </p>
                  <p className="font-body text-xs text-text-secondary">
                    {creator.user.email} · {creator.kyc_full_name} · {t("idCardLabel")}: {creator.kyc_id_number}
                    {creator.birth_date && ` · ${t("birthDateLabel")}: ${formatDate(creator.birth_date)}`}
                  </p>
                  {creator.address && (
                    <p className="font-body text-xs text-text-secondary">{t("addressLabel")}: {creator.address}</p>
                  )}
                  {creator.payout_method && (
                    <p className="font-body text-xs text-text-secondary">
                      {t("payoutLabel")}: {creator.payout_method} · {creator.payout_account_number} {t("accountHolderPrefix")} {creator.payout_account_holder}
                    </p>
                  )}
                  {creator.is_minor && creator.guardian_name && (
                    <p className="font-body text-xs text-text-secondary">
                      {t("guardianLabel")}: {creator.guardian_name} · {t("idCardLabel")}: {creator.guardian_id_number}
                    </p>
                  )}
                  {creator.has_ktp_photo && (
                    <a
                      href={kycDocumentUrl(creator.id)}
                      target="_blank"
                      rel="noreferrer"
                      className="font-body text-xs font-medium text-primary underline"
                    >
                      {t("viewKtpPhoto")}
                    </a>
                  )}
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    variant="secondary"
                    loading={loadingId === creator.id}
                    onClick={() => setRejectingId(creator.id)}
                  >
                    {t("reject")}
                  </Button>
                  <Button loading={loadingId === creator.id} onClick={() => handleApprove(creator.id)}>
                    {t("approve")}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
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
