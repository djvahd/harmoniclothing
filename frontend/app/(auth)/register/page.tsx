"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, User } from "lucide-react";
import AuthCard from "@/components/layout/AuthCard";
import Input from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";
import Button from "@/components/ui/Button";
import { register } from "@/services/auth";
import { ApiError } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
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
    setLoading(true);
    try {
      await register({
        ...form,
        privacy_accepted: accepted,
        terms_accepted: accepted,
      });
      router.push("/login?registered=1");
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        setErrors(err.errors);
      } else {
        setErrors({ general: ["Terjadi kesalahan, coba lagi."] });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard title="Buat Akun Baru">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="name"
          label="Nama Lengkap"
          icon={User}
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          error={errors.name?.[0]}
          required
        />
        <Input
          id="email"
          type="email"
          label="Email"
          icon={Mail}
          placeholder="nama@email.com"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          error={errors.email?.[0]}
          required
        />
        <PasswordInput
          id="password"
          label="Password"
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          error={errors.password?.[0]}
          required
        />
        <PasswordInput
          id="password_confirmation"
          label="Konfirmasi Password"
          value={form.password_confirmation}
          onChange={(e) => update("password_confirmation", e.target.value)}
          required
        />
        <label className="flex items-start gap-2 font-body text-xs text-text-secondary">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-0.5"
            required
          />
          Saya menyetujui{" "}
          <Link href="/syarat-ketentuan" className="font-medium text-primary" target="_blank">
            Syarat & Ketentuan
          </Link>{" "}
          dan{" "}
          <Link href="/kebijakan-privasi" className="font-medium text-primary" target="_blank">
            Kebijakan Privasi
          </Link>{" "}
          Harmoni Clothing.
        </label>
        {errors.general && <p className="font-body text-xs text-red-500">{errors.general[0]}</p>}
        <Button type="submit" fullWidth loading={loading}>
          Daftar Gratis
        </Button>
        <p className="font-body text-[13px] text-text-secondary">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-medium text-primary">
            Masuk
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
