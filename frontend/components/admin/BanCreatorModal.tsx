"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Portal from "@/components/ui/Portal";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import { useFocusTrap } from "@/hooks/useFocusTrap";

interface BanCreatorModalProps {
  open: boolean;
  creatorName: string;
  onConfirm: (reason: string, copyrightViolation: boolean) => void;
  onCancel: () => void;
}

const MIN_REASON_LENGTH = 10; // BanCreatorRequest: reason min:10

/** BR-019/020/023: ban reason + whether it is a proven copyright violation (which also suspends the account and holds commissions). */
export default function BanCreatorModal({ open, creatorName, onConfirm, onCancel }: BanCreatorModalProps) {
  const t = useTranslations("admin.creatorApproval.banModal");
  const tCommon = useTranslations("common");
  const [reason, setReason] = useState("");
  const [copyright, setCopyright] = useState(false);

  useEffect(() => {
    if (open) {
      setReason("");
      setCopyright(false);
    }
  }, [open]);
  useEscapeKey(open, onCancel);
  const dialogRef = useFocusTrap<HTMLDivElement>(open);

  if (!open) return null;

  return (
    <Portal>
    <div className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-black/45 px-4">
      <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label={t("title", { name: creatorName })} className="flex w-full max-w-md flex-col gap-4 rounded-md bg-surface p-6">
        <p className="font-heading text-lg font-semibold text-text-primary">{t("title", { name: creatorName })}</p>
        <Input label={t("label")} value={reason} onChange={(e) => setReason(e.target.value)} autoFocus />
        <p className="-mt-2 font-body text-xs text-text-secondary">{t("minChars", { count: MIN_REASON_LENGTH })}</p>
        <label className="flex items-start gap-2 font-body text-sm text-text-primary">
          <input type="checkbox" className="mt-1" checked={copyright} onChange={(e) => setCopyright(e.target.checked)} />
          <span>
            {t("copyrightLabel")}
            <span className="block font-body text-xs text-text-secondary">{t("copyrightHint")}</span>
          </span>
        </label>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onCancel}>{tCommon("cancel")}</Button>
          <Button variant="danger" disabled={reason.trim().length < MIN_REASON_LENGTH} onClick={() => onConfirm(reason.trim(), copyright)}>
            {t("confirm")}
          </Button>
        </div>
      </div>
    </div>
    </Portal>
  );
}
