"use client";

import { useEffect, useState } from "react";
import AccountSidebar from "@/components/layout/AccountSidebar";
import SidebarPageShell from "@/components/layout/SidebarPageShell";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useAuthStore } from "@/store/auth-store";
import { updateProfile } from "@/services/account";

export default function KelolaProfilPage() {
  const { user, setUser } = useAuthStore();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone ?? "");
    }
  }, [user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    try {
      const { data } = await updateProfile({ name, phone });
      setUser(data);
      setSaved(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SidebarPageShell sidebar={<AccountSidebar />}>
      <div className="flex max-w-lg flex-col gap-6">
        <h1 className="font-heading text-h3 font-semibold text-text-primary">Kelola Profil</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-md border border-border bg-surface p-5">
          <Input label="Nama Lengkap" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Nomor Telepon" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Input label="Email" value={user?.email ?? ""} disabled />
          {saved && <p className="font-body text-xs text-accent">Perubahan berhasil disimpan.</p>}
          <Button type="submit" loading={loading}>
            Simpan Perubahan
          </Button>
        </form>
      </div>
    </SidebarPageShell>
  );
}
