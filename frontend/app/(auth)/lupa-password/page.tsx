"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import AuthCard from "@/components/layout/AuthCard";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { forgotPassword } from "@/services/auth";
import { ApiError } from "@/lib/api";

export default function LupaPasswordPage() {
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
      setError(err instanceof ApiError ? err.message : "Terjadi kesalahan, coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard title="Lupa Password">
      {sent ? (
        <p className="font-body text-sm text-text-secondary">
          Jika email terdaftar, tautan reset password telah dikirim ke {email}.
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
            placeholder="nama@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {error && <p className="font-body text-xs text-red-500">{error}</p>}
          <Button type="submit" fullWidth loading={loading}>
            Kirim Tautan Reset
          </Button>
        </form>
      )}
      <p className="font-body text-body-sm text-text-secondary">
        Kembali ke{" "}
        <Link href="/login" className="font-medium text-primary">
          Masuk
        </Link>
      </p>
    </AuthCard>
  );
}
