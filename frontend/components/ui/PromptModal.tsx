"use client";

import { useState, useEffect } from "react";
import Button from "./Button";
import Input from "./Input";

interface PromptModalProps {
  open: boolean;
  title: string;
  label: string;
  minLength?: number;
  confirmLabel?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

export default function PromptModal({
  open,
  title,
  label,
  minLength = 0,
  confirmLabel = "Konfirmasi",
  onConfirm,
  onCancel,
}: PromptModalProps) {
  const [value, setValue] = useState("");

  useEffect(() => {
    if (open) setValue("");
  }, [open]);

  if (!open) return null;

  const invalid = value.trim().length < minLength;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
      <div className="flex w-full max-w-sm flex-col gap-4 rounded-md bg-surface p-6">
        <p className="font-heading text-lg font-semibold text-text-primary">{title}</p>
        <Input
          label={label}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
        />
        {minLength > 0 && (
          <p className="-mt-2 font-body text-xs text-text-secondary">
            Minimal {minLength} karakter.
          </p>
        )}
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onCancel}>
            Batal
          </Button>
          <Button disabled={invalid} onClick={() => onConfirm(value.trim())}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
