"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail } from "lucide-react";
import AuthCard from "@/components/layout/AuthCard";
import Input from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";
import Button from "@/components/ui/Button";
import { useAuthStore } from "@/store/auth-store";
import { ApiError } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
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
      router.push("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Terjadi kesalahan, coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard title="Masuk ke Akun">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
        <PasswordInput
          id="password"
          label="Password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Link href="/lupa-password" className="font-body text-body-sm font-medium text-primary">
          Lupa password?
        </Link>
        {error && <p className="font-body text-xs text-red-500">{error}</p>}
        <Button type="submit" fullWidth loading={loading}>
          Masuk
        </Button>
        <p className="font-body text-body-sm text-text-secondary">
          Belum punya akun?{" "}
          <Link href="/register" className="font-medium text-primary">
            Daftar
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
