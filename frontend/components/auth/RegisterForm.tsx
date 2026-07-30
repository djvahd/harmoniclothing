"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, User } from "lucide-react";
import { useTranslations } from "next-intl";
import Input from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";
import Button from "@/components/ui/Button";
import { register } from "@/services/auth";
import { useAuthModalStore } from "@/store/auth-modal-store";
import { ApiError } from "@/lib/api";

const linkClass =
  "font-medium text-primary transition-colors hover:text-accent hover:underline hover:underline-offset-4";

export default function RegisterForm() {
  const t = useTranslations("auth.register");
  const tCommon = useTranslations("common");
  const openModal = useAuthModalStore((state) => state.open);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [accepted, setAccepted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    if (form.password !== form.password_confirmation) {
      setErrors({ password_confirmation: [t("passwordMismatch")] });
      return;
    }
    setLoading(true);
    try {
      await register({
        ...form,
        privacy_accepted: accepted,
        terms_accepted: accepted,
      });
      openModal("login", t("registerSuccess"));
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        setErrors(err.errors);
      } else {
        setErrors({ general: [tCommon("errorGeneric")] });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        id="name"
        label={t("fullName")}
        icon={User}
        autoComplete="name"
        value={form.name}
        onChange={(e) => update("name", e.target.value)}
        error={errors.name?.[0]}
        required
      />
      <Input
        id="email"
        type="email"
        label={t("email")}
        icon={Mail}
        autoComplete="email"
        value={form.email}
        onChange={(e) => update("email", e.target.value)}
        error={errors.email?.[0]}
        required
      />
      <PasswordInput
        id="password"
        label={t("password")}
        autoComplete="new-password"
        value={form.password}
        onChange={(e) => update("password", e.target.value)}
        error={errors.password?.[0]}
        required
      />
      <PasswordInput
        id="password_confirmation"
        label={t("confirmPassword")}
        autoComplete="new-password"
        value={form.password_confirmation}
        onChange={(e) => update("password_confirmation", e.target.value)}
        error={errors.password_confirmation?.[0]}
        required
      />
      <label className="flex items-start gap-2 font-body text-xs text-text-secondary">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          className="mt-0.5 shrink-0"
          required
        />
        <span>
          {t("agreeTo")}{" "}
          <Link href="/legal/terms" className={linkClass} target="_blank">
            {t("termsLink")}
          </Link>{" "}
          {t("and")}{" "}
          <Link href="/legal/privacy-policy" className={linkClass} target="_blank">
            {t("privacyLink")}
          </Link>{" "}
          {t("brandSuffix")}
        </span>
      </label>
      {errors.general && <p className="font-body text-xs text-danger">{errors.general[0]}</p>}
      <Button type="submit" fullWidth loading={loading}>
        {t("submit")}
      </Button>
      <p className="font-body text-body-sm text-text-secondary">
        {t("hasAccount")}{" "}
        <button type="button" onClick={() => openModal("login")} className={linkClass}>
          {t("loginLink")}
        </button>
      </p>
    </form>
  );
}
