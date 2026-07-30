"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import AccountSidebar from "@/components/layout/AccountSidebar";
import SidebarPageShell from "@/components/layout/SidebarPageShell";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useAuthStore } from "@/store/auth-store";
import { updateProfile } from "@/services/account";

export default function KelolaProfilPage() {
  const t = useTranslations("customer.profile");
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
        <h1 className="font-heading text-h3 font-semibold text-text-primary">{t("title")}</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-md border border-border bg-surface p-5">
          <Input label={t("fullName")} value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label={t("phoneNumber")} value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Input label={t("email")} value={user?.email ?? ""} disabled />
          {saved && <p className="font-body text-xs text-accent">{t("saveSuccess")}</p>}
          <Button type="submit" loading={loading}>
            {t("saveChanges")}
          </Button>
        </form>
      </div>
    </SidebarPageShell>
  );
}
