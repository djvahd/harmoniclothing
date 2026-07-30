"use client";

"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";

/** Shared body for every route group's `error.tsx` boundary; logs the error and offers a retry button. */
export default function ErrorState({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("ui.errorState");
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-4 px-4 text-center">
      <AlertTriangle className="size-10 text-danger" />
      <p className="font-heading text-h3 font-semibold text-text-primary">{t("title")}</p>
      <p className="font-body text-sm text-text-secondary">{t("description")}</p>
      <Button onClick={() => reset()}>{t("retry")}</Button>
    </div>
  );
}
