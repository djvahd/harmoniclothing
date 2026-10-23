"use client";

"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Button from "./Button";
import Input from "./Input";
import Portal from "./Portal";
import { useEscapeKey } from "@/hooks/useEscapeKey";

interface PromptModalProps {
  open: boolean;
  title: string;
  label: string;
  minLength?: number;
  confirmLabel?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

/** Single-field text-input confirmation modal (e.g. rejection reason); disables confirm until `minLength` is met. */
export default function PromptModal({
  open,
  title,
  label,
  minLength = 0,
  confirmLabel,
  onConfirm,
  onCancel,
}: PromptModalProps) {
  const t = useTranslations("ui.promptModal");
  const tCommon = useTranslations("common");
  const [value, setValue] = useState("");

  useEffect(() => {
    if (open) setValue("");
  }, [open]);
  useEscapeKey(open, onCancel);

  if (!open) return null;

  const invalid = value.trim().length < minLength;

  return (
    <Portal>
    <div className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-black/45 px-4">
      <div role="dialog" aria-modal="true" aria-label={title} className="flex w-full max-w-sm flex-col gap-4 rounded-md bg-surface p-6">
        <p className="font-heading text-lg font-semibold text-text-primary">{title}</p>
        <Input
          label={label}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
        />
        {minLength > 0 && (
          <p className="-mt-2 font-body text-xs text-text-secondary">
            {t("minChars", { count: minLength })}
          </p>
        )}
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onCancel}>
            {tCommon("cancel")}
          </Button>
          <Button disabled={invalid} onClick={() => onConfirm(value.trim())}>
            {confirmLabel ?? tCommon("confirm")}
          </Button>
        </div>
      </div>
    </div>
    </Portal>
  );
}
