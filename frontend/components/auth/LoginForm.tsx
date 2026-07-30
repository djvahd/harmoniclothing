"use client";

import { useState } from "react";
import { CheckCircle2, Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import Input from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";
import Button from "@/components/ui/Button";
import { useAuthStore } from "@/store/auth-store";
import { useAuthModalStore } from "@/store/auth-modal-store";
import { getErrorMessage } from "@/lib/api";

const linkClass =
  "font-medium text-primary transition-colors hover:text-accent hover:underline hover:underline-offset-4";

export default function LoginForm({ message }: { message: string | null }) {
  const t = useTranslations("auth.login");
  const tCommon = useTranslations("common");
  const login = useAuthStore((state) => state.login);
  const closeModal = useAuthModalStore((state) => state.close);
  const openModal = useAuthModalStore((state) => state.open);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      closeModal();
    } catch (err) {
      setError(getErrorMessage(err, tCommon("errorGeneric")));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {message && (
        <p className="flex items-center gap-2 rounded-sm bg-accent/10 px-3 py-2.5 font-body text-xs font-medium text-accent">
          <CheckCircle2 className="size-4 shrink-0" />
          {message}
        </p>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
        <PasswordInput
          id="password"
          label={t("password")}
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="button" onClick={() => openModal("lupa-password")} className={`w-fit font-body text-body-sm ${linkClass}`}>
          {t("forgotPassword")}
        </button>
        {error && <p className="font-body text-xs text-danger">{error}</p>}
        <Button type="submit" fullWidth loading={loading}>
          {t("submit")}
        </Button>
        <p className="font-body text-body-sm text-text-secondary">
          {t("noAccount")}{" "}
          <button type="button" onClick={() => openModal("register")} className={linkClass}>
            {t("registerLink")}
          </button>
        </p>
      </form>
    </>
  );
}
