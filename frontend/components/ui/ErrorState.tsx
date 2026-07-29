"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import Button from "@/components/ui/Button";

export default function ErrorState({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-4 px-4 text-center">
      <AlertTriangle className="size-10 text-danger" />
      <p className="font-heading text-h3 font-semibold text-text-primary">Terjadi kesalahan.</p>
      <p className="font-body text-sm text-text-secondary">
        Maaf, ada yang tidak beres. Coba muat ulang halaman.
      </p>
      <Button onClick={() => reset()}>Coba Lagi</Button>
    </div>
  );
}
