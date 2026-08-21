/** The signed-in customer's own account: address book CRUD and profile updates. */
import { apiFetch } from "@/lib/api";
import type { Address, User } from "@/types/user";

export function getAddresses() {
  return apiFetch<{ data: Address[] }>("/account/addresses");
}

export function createAddress(payload: Omit<Address, "id">) {
  return apiFetch<{ data: Address }>("/account/addresses", {
    method: "POST",
    body: payload,
  });
}

export function updateAddress(id: number, payload: Partial<Omit<Address, "id">>) {
  return apiFetch<{ data: Address }>(`/account/addresses/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export function deleteAddress(id: number) {
  return apiFetch<{ data: null }>(`/account/addresses/${id}`, { method: "DELETE" });
}

export function updateProfile(payload: { name?: string; phone?: string }) {
  return apiFetch<{ data: User }>("/account/profile", { method: "PATCH", body: payload });
}

export function uploadProfilePhoto(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return apiFetch<{ data: User }>("/account/photo", { method: "POST", body: formData, isFormData: true });
}

export function removeProfilePhoto() {
  return apiFetch<{ data: User }>("/account/photo", { method: "DELETE" });
}
