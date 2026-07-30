"use client";

import { useState } from "react";
import { CheckCircle2, Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { forgotPassword } from "@/services/auth";
import { useAuthModalStore } from "@/store/auth-modal-store";
import { getErrorMessage } from "@/lib/api";

const linkClass =
  "font-medium text-primary transition-colors hover:text-accent hover:underline hover:underline-offset-4";

export default function LupaPasswordForm() {
  const t = useTranslations("auth.forgotPassword");
  const tCommon = useTranslations("common");
  const openModal = useAuthModalStore((state) => state.open);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(getErrorMessage(err, tCommon("errorGeneric")));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {sent ? (
        <p className="flex items-start gap-2 rounded-sm bg-accent/10 px-3 py-2.5 font-body text-sm text-text-secondary">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-accent" />
          {t("sentMessage", { email })}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <p className="font-body text-sm text-text-secondary">{t("description")}</p>
          <Input
            id="email"
            type="email"
            label={t("email")}
            icon={Mail}
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {error && <p className="font-body text-xs text-danger">{error}</p>}
          <Button type="submit" fullWidth loading={loading}>
            {t("submit")}
          </Button>
        </form>
      )}
      <p className="font-body text-body-sm text-text-secondary">
        {t("backTo")}{" "}
        <button type="button" onClick={() => openModal("login")} className={linkClass}>
          {t("loginLink")}
        </button>
      </p>
    </div>
  );
}
