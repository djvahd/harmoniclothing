"use client";

import { useMemo, useState } from "react";
import { Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import CreatorSidebar from "@/components/layout/CreatorSidebar";
import SidebarPageShell from "@/components/layout/SidebarPageShell";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { submitVerification } from "@/services/creator";
import { getErrorMessage } from "@/lib/api";

const PAYOUT_METHODS = [
  { value: "bank_transfer", tKey: "bankTransfer" },
  { value: "gopay", tKey: "gopay" },
  { value: "ovo", tKey: "ovo" },
  { value: "dana", tKey: "dana" },
  { value: "shopeepay", tKey: "shopeepay" },
] as const;

function calculateAge(birthDate: string): number | null {
  if (!birthDate) return null;
  const today = new Date();
  const dob = new Date(birthDate);
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

export default function VerifikasiDataDiriPage() {
  const t = useTranslations("creator.verification");
  const tCommon = useTranslations("common");
  const [fullName, setFullName] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [address, setAddress] = useState("");
  const [ktpPhoto, setKtpPhoto] = useState<File | null>(null);
  const [payoutMethod, setPayoutMethod] = useState<(typeof PAYOUT_METHODS)[number]["value"]>("bank_transfer");
  const [payoutAccountNumber, setPayoutAccountNumber] = useState("");
  const [payoutAccountHolder, setPayoutAccountHolder] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [guardianIdNumber, setGuardianIdNumber] = useState("");
  const [guardianConsent, setGuardianConsent] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const age = useMemo(() => calculateAge(birthDate), [birthDate]);
  const isMinor = age !== null && age < 18;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ktpPhoto) {
      setError(t("uploadKtpError"));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data } = await submitVerification({
        kyc_full_name: fullName,
        kyc_id_number: idNumber,
        birth_date: birthDate,
        address,
        ktp_photo: ktpPhoto,
        payout_method: payoutMethod,
        payout_account_number: payoutAccountNumber,
        payout_account_holder: payoutAccountHolder,
        ...(isMinor
          ? { guardian_name: guardianName, guardian_id_number: guardianIdNumber, guardian_consent: guardianConsent }
          : {}),
      });
      setStatus(data.status);
    } catch (err) {
      setError(getErrorMessage(err, tCommon("errorGeneric")));
    } finally {
      setLoading(false);
    }
  }

  return (
    <SidebarPageShell sidebar={<CreatorSidebar />}>
      <div className="flex max-w-lg flex-col gap-6">
        <h1 className="font-heading text-h3 font-semibold text-text-primary">
          {t("title")}
        </h1>
        {status && (
          <div className="flex items-center gap-2">
            <span className="font-body text-sm text-text-secondary">{t("statusLabel")}</span>
            <Badge variant={status === "aktif" ? "success" : "warning"}>
              {status === "menunggu_approval" ? t("statusPendingReview") : status}
            </Badge>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-md border border-border bg-surface p-5">
          <Input label={t("fields.fullName")} value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          <Input label={t("fields.idNumber")} value={idNumber} onChange={(e) => setIdNumber(e.target.value)} required />
          <Input
            label={t("fields.birthDate")}
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            required
          />
          <div className="flex flex-col gap-1.5">
            <label className="font-body text-xs font-medium text-text-secondary">{t("fields.address")}</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
              required
              className="w-full rounded-sm border border-border bg-surface px-3 py-2.5 font-body text-sm text-text-primary outline-none"
            />
          </div>

          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-sm border border-dashed border-border py-6 text-center">
            <Upload className="size-5 text-text-secondary" />
            <span className="font-body text-xs text-text-secondary">
              {ktpPhoto ? ktpPhoto.name : t("fields.ktpPlaceholder")}
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={(e) => setKtpPhoto(e.target.files?.[0] ?? null)}
            />
          </label>

          <div className="flex flex-col gap-1.5">
            <label className="font-body text-xs font-medium text-text-secondary">{t("fields.payoutMethod")}</label>
            <select
              value={payoutMethod}
              onChange={(e) => setPayoutMethod(e.target.value as typeof payoutMethod)}
              className="w-full rounded-sm border border-border bg-surface px-3 py-2.5 font-body text-sm text-text-primary outline-none"
            >
              {PAYOUT_METHODS.map((method) => (
                <option key={method.value} value={method.value}>
                  {t(`payoutMethods.${method.tKey}`)}
                </option>
              ))}
            </select>
          </div>
          <Input
            label={payoutMethod === "bank_transfer" ? t("fields.accountNumber") : t("fields.phoneNumber")}
            value={payoutAccountNumber}
            onChange={(e) => setPayoutAccountNumber(e.target.value)}
            required
          />
          <Input
            label={t("fields.accountHolder")}
            value={payoutAccountHolder}
            onChange={(e) => setPayoutAccountHolder(e.target.value)}
            required
          />

          {isMinor && (
            <div className="flex flex-col gap-4 rounded-sm border border-accent/30 bg-accent/5 p-4">
              <p className="font-body text-xs font-medium text-text-primary">{t("minorNotice")}</p>
              <Input
                label={t("fields.guardianName")}
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                required
              />
              <Input
                label={t("fields.guardianIdNumber")}
                value={guardianIdNumber}
                onChange={(e) => setGuardianIdNumber(e.target.value)}
                required
              />
              <label className="flex items-start gap-2 font-body text-xs text-text-secondary">
                <input
                  type="checkbox"
                  checked={guardianConsent}
                  onChange={(e) => setGuardianConsent(e.target.checked)}
                  className="mt-0.5"
                  required
                />
                {t("guardianConsent")}
              </label>
            </div>
          )}

          {error && <p className="font-body text-xs text-danger">{error}</p>}
          <Button type="submit" loading={loading}>
            {t("submit")}
          </Button>
        </form>
        <p className="font-body text-xs text-text-secondary">{t("footerNote")}</p>
      </div>
    </SidebarPageShell>
  );
}
