"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import AuthCard from "@/components/layout/AuthCard";
import Button from "@/components/ui/Button";
import { verifyEmail } from "@/services/auth";
import { useAuthModalStore } from "@/store/auth-modal-store";
import { getErrorMessage } from "@/lib/api";

type Status = "verifying" | "success" | "error";

function VerifyEmailContent() {
  const t = useTranslations("auth.verifyEmail");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const params = useSearchParams();
  const openAuthModal = useAuthModalStore((state) => state.open);
  const [status, setStatus] = useState<Status>("verifying");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = params.get("id");
    const hash = params.get("hash");
    const expires = params.get("expires");
    const signature = params.get("signature");

    if (!id || !hash || !expires || !signature) {
      setStatus("error");
      setError(tCommon("errorGeneric"));
      return;
    }

    verifyEmail(id, hash, expires, signature)
      .then(() => setStatus("success"))
      .catch((err) => {
        setStatus("error");
        setError(getErrorMessage(err, tCommon("errorGeneric")));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleContinue() {
    openAuthModal("login", t("success"));
    router.push("/");
  }

  return (
    <AuthCard title={t("title")}>
      {status === "verifying" && <p className="font-body text-sm text-text-secondary">{t("verifying")}</p>}
      {status === "success" && (
        <div className="flex flex-col gap-4">
          <p className="font-body text-sm text-text-secondary">{t("success")}</p>
          <Button onClick={handleContinue} fullWidth>
            {t("continue")}
          </Button>
        </div>
      )}
      {status === "error" && (
        <div className="flex flex-col gap-4">
          <p className="font-body text-xs text-danger">{error}</p>
          <Button onClick={() => router.push("/")} fullWidth variant="secondary">
            {tCommon("back")}
          </Button>
        </div>
      )}
    </AuthCard>
  );
}

export default function VerifyEmailPage() {
  return <VerifyEmailContent />;
}
