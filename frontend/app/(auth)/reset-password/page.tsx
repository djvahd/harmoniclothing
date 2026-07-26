"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthCard from "@/components/layout/AuthCard";
import PasswordInput from "@/components/ui/PasswordInput";
import Button from "@/components/ui/Button";
import { resetPassword } from "@/services/auth";
import { useAuthModalStore } from "@/store/auth-modal-store";
import { ApiError } from "@/lib/api";

function ResetPasswordForm() {
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
      openAuthModal("login", "Password berhasil diperbarui. Silakan masuk.");
      router.push("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Terjadi kesalahan, coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard title="Buat Password Baru">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <PasswordInput
          id="password"
          label="Password Baru"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <PasswordInput
          id="password_confirmation"
          label="Konfirmasi Password Baru"
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          required
        />
        {error && <p className="font-body text-xs text-red-500">{error}</p>}
        <Button type="submit" fullWidth loading={loading}>
          Simpan Password Baru
        </Button>
      </form>
    </AuthCard>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
