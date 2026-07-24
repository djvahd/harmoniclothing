import { apiFetch } from "@/lib/api";
import type { User } from "@/types/user";
import type { Design, PrintArea, Product, ProductVariant } from "@/types/product";
import type { Order } from "@/types/order";

export interface AdminDashboardSummary {
  users: { customers_total: number; creators_active: number; creators_pending: number };
  designs: { pending: number };
  orders: {
    menunggu_approval: number;
    diproses_produksi: number;
    dikirim: number;
    selesai: number;
  };
  revenue: { total: string };
}

export interface AdminCreatorProfile {
  id: number;
  user: { id: number; name: string; email: string };
  slug: string;
  brand_name: string | null;
  bio: string | null;
  portfolio_url: string | null;
  kyc_full_name: string;
  kyc_id_number: string;
  birth_date: string | null;
  is_minor: boolean;
  address: string | null;
  has_ktp_photo: boolean;
  payout_method: string | null;
  payout_account_number: string | null;
  payout_account_holder: string | null;
  guardian_name: string | null;
  guardian_id_number: string | null;
  guardian_consent_at: string | null;
  status: string;
  rejection_reason: string | null;
  approved_at: string | null;
  created_at: string;
}

export interface Payment {
  id: number;
  method: string;
  amount: number;
  status: string;
  paid_at: string | null;
  order: { id: number; order_number: string; user: { id: number; name: string } };
}

export interface NotificationSetting {
  notification_type: string;
  is_enabled: boolean;
}

export interface SalesReport {
  period: { from: string; to: string };
  revenue: { total: string; average_order_value: string };
  orders: { total: number; by_status: Record<string, number> };
  top_products: { product_id: number; name: string; quantity_sold: number; revenue: string }[];
}

export interface AuditLog {
  id: number;
  action: string;
  actor: { id: number; name: string };
  subject_type: string | null;
  subject_id: number | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

interface Paginated<T> {
  data: T[];
  meta: { current_page: number; per_page: number; total: number };
}

export function getDashboardSummary() {
  return apiFetch<{ data: AdminDashboardSummary }>("/admin/dashboard");
}

export function getUsers(params?: { role?: string; status?: string }) {
  const qs = new URLSearchParams();
  if (params?.role) qs.set("role", params.role);
  if (params?.status) qs.set("status", params.status);
  const query = qs.toString();
  return apiFetch<Paginated<User>>(`/admin/users${query ? `?${query}` : ""}`);
}

export function getPendingCreators() {
  return apiFetch<{ data: AdminCreatorProfile[] }>("/admin/creators/pending");
}

/** Sanctum session cookie auth means an <img> tag sends it automatically — no separate fetch/blob needed. */
export function kycDocumentUrl(creatorProfileId: number): string {
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  return `${API_URL}/api/admin/creators/${creatorProfileId}/kyc-document`;
}

export function approveCreator(id: number) {
  return apiFetch<{ data: AdminCreatorProfile }>(`/admin/creators/${id}/approve`, {
    method: "POST",
  });
}

export function rejectCreator(id: number, reason: string) {
  return apiFetch<{ data: AdminCreatorProfile }>(`/admin/creators/${id}/reject`, {
    method: "POST",
    body: { reason },
  });
}

export function banCreator(id: number, reason: string, copyrightViolation = false) {
  return apiFetch<{ data: AdminCreatorProfile }>(`/admin/creators/${id}/ban`, {
    method: "POST",
    body: { reason, copyright_violation: copyrightViolation },
  });
}

export function getPendingDesigns() {
  return apiFetch<{ data: Design[] }>("/admin/designs/pending");
}

export function approveDesign(id: number) {
  return apiFetch<{ data: Design }>(`/admin/designs/${id}/approve`, { method: "POST" });
}

export function rejectDesign(id: number, reason: string) {
  return apiFetch<{ data: Design }>(`/admin/designs/${id}/reject`, {
    method: "POST",
    body: { reason },
  });
}

export function createProduct(payload: {
  category_id?: number;
  gender_segment?: "pria" | "wanita" | "unisex" | "anak";
  name_id: string;
  name_en: string;
  description_id?: string;
  description_en?: string;
  base_price: number;
  compare_price?: number | null;
  is_active?: boolean;
}) {
  return apiFetch<{ data: Product }>("/admin/catalog/products", {
    method: "POST",
    body: payload,
  });
}

export function updateProduct(id: number, payload: Partial<Parameters<typeof createProduct>[0]>) {
  return apiFetch<{ data: Product }>(`/admin/catalog/products/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export function createVariant(
  productId: number,
  payload: {
    color: string;
    size: string;
    cut_type: string;
    print_areas?: PrintArea[];
    material: string;
    price_modifier?: number;
    mockup_asset_path: string;
  },
) {
  return apiFetch<{ data: ProductVariant }>(`/admin/catalog/products/${productId}/variants`, {
    method: "POST",
    body: payload,
  });
}

export function updateVariant(variantId: number, payload: Partial<Parameters<typeof createVariant>[1]>) {
  return apiFetch<{ data: ProductVariant }>(`/admin/catalog/variants/${variantId}`, {
    method: "PATCH",
    body: payload,
  });
}

export function createBulkPricingTier(payload: {
  min_qty: number;
  max_qty?: number;
  price_per_unit: number;
}) {
  return apiFetch<{ data: unknown }>("/admin/catalog/bulk-pricing-tiers", {
    method: "POST",
    body: payload,
  });
}

export function getProductionQueue() {
  return apiFetch<{ data: Order[] }>("/admin/production-queue");
}

export function updateOrderStatus(id: number) {
  return apiFetch<{ data: Order }>(`/admin/orders/${id}/status`, {
    method: "PATCH",
    body: { status: "diproses_produksi" },
  });
}

export function rejectOrder(id: number, reason: string) {
  return apiFetch<{ data: Order }>(`/admin/orders/${id}/reject`, {
    method: "POST",
    body: { reason },
  });
}

export function bookShipment(id: number, courier: string) {
  return apiFetch<{ data: unknown }>(`/admin/orders/${id}/shipment`, {
    method: "POST",
    body: { courier },
  });
}

export function getPayments(params?: { status?: string }) {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  const query = qs.toString();
  return apiFetch<Paginated<Payment>>(`/admin/payments${query ? `?${query}` : ""}`);
}

export function getAdminChatThreads() {
  return apiFetch<{
    data: { id: number; assigned_admin_id: number | null; last_message_at: string | null; customer: { id: number; name: string } }[];
  }>("/admin/chat/threads");
}

export function getAdminChatMessages(threadId: number) {
  return apiFetch<{ data: import("@/types/notification").ChatMessage[] }>(
    `/admin/chat/threads/${threadId}/messages`,
  );
}

export function sendAdminChatMessage(threadId: number, message: string) {
  return apiFetch<{ data: import("@/types/notification").ChatMessage }>(
    `/admin/chat/threads/${threadId}/messages`,
    { method: "POST", body: { message } },
  );
}

export function getNotificationSettings() {
  return apiFetch<{ data: NotificationSetting[] }>("/admin/notification-settings");
}

export function updateNotificationSetting(type: string, isEnabled: boolean) {
  return apiFetch<{ data: NotificationSetting }>(`/admin/notification-settings/${type}`, {
    method: "PATCH",
    body: { is_enabled: isEnabled },
  });
}

export function getSalesReport(params?: { from?: string; to?: string }) {
  const qs = new URLSearchParams();
  if (params?.from) qs.set("from", params.from);
  if (params?.to) qs.set("to", params.to);
  const query = qs.toString();
  return apiFetch<{ data: SalesReport }>(`/admin/reports/sales${query ? `?${query}` : ""}`);
}

export function getAuditLogs() {
  return apiFetch<Paginated<AuditLog>>("/admin/audit-logs");
}
