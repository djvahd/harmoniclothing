"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import AuthCard from "@/components/layout/AuthCard";
import PasswordInput from "@/components/ui/PasswordInput";
import Button from "@/components/ui/Button";
import { resetPassword } from "@/services/auth";
import { useAuthModalStore } from "@/store/auth-modal-store";
import { getErrorMessage } from "@/lib/api";

function ResetPasswordForm() {
  const t = useTranslations("auth.resetPassword");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const params = useSearchParams();
  const openAuthModal = useAuthModalStore((state) => state.open);
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await resetPassword({
        token: params.get("token") ?? "",
        email: params.get("email") ?? "",
        password,
        password_confirmation: passwordConfirmation,
      });
      openAuthModal("login", t("success"));
      router.push("/");
    } catch (err) {
      setError(getErrorMessage(err, tCommon("errorGeneric")));
    } finally {
      setLoading(false);
    }
  }

  if (!params.get("token") || !params.get("email")) {
    return (
      <AuthCard title={t("invalidTitle")}>
        <div className="flex flex-col gap-4">
          <p className="font-body text-sm text-text-secondary">{t("invalidDescription")}</p>
          <Button
            onClick={() => {
              openAuthModal("lupa-password");
              router.push("/");
            }}
            fullWidth
          >
            {t("invalidAction")}
          </Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title={t("title")}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <PasswordInput
          id="password"
          label={t("newPassword")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <PasswordInput
          id="password_confirmation"
          label={t("confirmNewPassword")}
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          required
        />
        {error && <p className="font-body text-xs text-danger">{error}</p>}
        <Button type="submit" fullWidth loading={loading}>
          {t("submit")}
        </Button>
      </form>
    </AuthCard>
  );
}

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
