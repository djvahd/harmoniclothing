/** Creator-side account and workspace: upgrade application, KYC verification, dashboard/earnings, and design upload/submit. */
import { apiFetch } from "@/lib/api";
import type { Design } from "@/types/product";

export interface CreatorDashboard {
  total_designs: number;
  active_designs: number;
  pending_designs: number;
}

export interface Commission {
  id: number;
  amount: string;
  status: "terhutang" | "dibayar" | "ditahan";
  paid_at: string | null;
  created_at: string;
}

export interface CommissionSummary {
  total: string;
  terhutang: string;
  dibayar: string;
  ditahan: string;
}

export function becomeCreator(payload: {
  terms_accepted: boolean;
  brand_name?: string;
  bio?: string;
  portfolio_url?: string;
}) {
  return apiFetch<{ data: { slug: string; status: string } }>("/account/become-creator", {
    method: "POST",
    body: payload,
  });
}

export interface VerificationPayload {
  kyc_full_name: string;
  kyc_id_number: string;
  birth_date: string;
  address: string;
  ktp_photo: File;
  payout_method: "bank_transfer" | "gopay" | "ovo" | "dana" | "shopeepay";
  payout_account_number: string;
  payout_account_holder: string;
  guardian_name?: string;
  guardian_id_number?: string;
  guardian_consent?: boolean;
}

export function submitVerification(payload: VerificationPayload) {
  const formData = new FormData();
  formData.append("kyc_full_name", payload.kyc_full_name);
  formData.append("kyc_id_number", payload.kyc_id_number);
  formData.append("birth_date", payload.birth_date);
  formData.append("address", payload.address);
  formData.append("ktp_photo", payload.ktp_photo);
  formData.append("payout_method", payload.payout_method);
  formData.append("payout_account_number", payload.payout_account_number);
  formData.append("payout_account_holder", payload.payout_account_holder);
  if (payload.guardian_name) formData.append("guardian_name", payload.guardian_name);
  if (payload.guardian_id_number) formData.append("guardian_id_number", payload.guardian_id_number);
  if (payload.guardian_consent) formData.append("guardian_consent", "1");

  return apiFetch<{ data: { status: string } }>("/creator/verification", {
    method: "POST",
    body: formData,
    isFormData: true,
  });
}

export function getCreatorDashboard() {
  return apiFetch<{ data: CreatorDashboard }>("/creator/dashboard");
}

export function getEarnings() {
  return apiFetch<{ data: Commission[]; summary: CommissionSummary }>("/creator/earnings");
}

export function getMyDesigns() {
  return apiFetch<{ data: Design[] }>("/creator/designs");
}

export function createDesign(payload: {
  title: string;
  description?: string;
  category_id?: number;
  file: File;
  product_ids: number[];
  tags?: string[];
}) {
  const formData = new FormData();
  formData.append("title", payload.title);
  if (payload.description) formData.append("description", payload.description);
  if (payload.category_id) formData.append("category_id", String(payload.category_id));
  formData.append("file", payload.file);
  payload.product_ids.forEach((id) => formData.append("product_ids[]", String(id)));
  payload.tags?.forEach((tag) => formData.append("tags[]", tag));

  return apiFetch<{ data: Design }>("/creator/designs", {
    method: "POST",
    body: formData,
    isFormData: true,
  });
}

export function confirmApparel(designId: number, productId: number) {
  return apiFetch<{ data: Design }>(`/creator/designs/${designId}/apparel/${productId}/confirm`, {
    method: "POST",
  });
}

export function submitDesign(designId: number) {
  return apiFetch<{ data: Design }>(`/creator/designs/${designId}/submit`, { method: "POST" });
}
