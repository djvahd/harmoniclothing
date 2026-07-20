"use client";

import { X } from "lucide-react";

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function MobileDrawer({ open, onClose, children }: MobileDrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/45" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 flex w-72 flex-col gap-6 bg-surface p-6 shadow-lg">
        <button
          type="button"
          aria-label="Tutup menu"
          onClick={onClose}
          className="self-end text-text-secondary"
        >
          <X className="size-5" />
        </button>
        {children}
      </div>
    </div>
  );
}
