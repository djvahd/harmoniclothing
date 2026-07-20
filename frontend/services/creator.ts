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

export function becomeCreator() {
  return apiFetch<{ data: { slug: string; status: string } }>("/account/become-creator", {
    method: "POST",
  });
}

export function submitVerification(payload: { kyc_full_name: string; kyc_id_number: string }) {
  return apiFetch<{ data: { status: string } }>("/creator/verification", {
    method: "POST",
    body: payload,
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
}) {
  const formData = new FormData();
  formData.append("title", payload.title);
  if (payload.description) formData.append("description", payload.description);
  if (payload.category_id) formData.append("category_id", String(payload.category_id));
  formData.append("file", payload.file);
  payload.product_ids.forEach((id) => formData.append("product_ids[]", String(id)));

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
