"use client";

import { useState } from "react";
import { CheckCircle2, Mail } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { forgotPassword } from "@/services/auth";
import { useAuthModalStore } from "@/store/auth-modal-store";
import { getErrorMessage } from "@/lib/api";

const linkClass =
  "font-medium text-primary transition-colors hover:text-accent hover:underline hover:underline-offset-4";

export default function LupaPasswordForm() {
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
      setError(getErrorMessage(err, "Terjadi kesalahan, coba lagi."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {sent ? (
        <p className="flex items-start gap-2 rounded-sm bg-accent/10 px-3 py-2.5 font-body text-sm text-text-secondary">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-accent" />
          Jika email terdaftar, tautan reset password telah dikirim ke{" "}
          <span className="font-medium text-text-primary">{email}</span>.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <p className="font-body text-sm text-text-secondary">
            Masukkan email akunmu, kami akan kirimkan tautan untuk reset password.
          </p>
          <Input
            id="email"
            type="email"
            label="Email"
            icon={Mail}
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {error && <p className="font-body text-xs text-danger">{error}</p>}
          <Button type="submit" fullWidth loading={loading}>
            Kirim Tautan Reset
          </Button>
        </form>
      )}
      <p className="font-body text-body-sm text-text-secondary">
        Kembali ke{" "}
        <button type="button" onClick={() => openModal("login")} className={linkClass}>
          Masuk
        </button>
      </p>
    </div>
  );
}
