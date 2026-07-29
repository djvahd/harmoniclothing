/** Uploads a customer's own design file for the product customizer, returning its stored path/URL. */
import { apiFetch } from "@/lib/api";

export function uploadDesignFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return apiFetch<{ data: { path: string; url: string } }>("/customization/uploads", {
    method: "POST",
    body: formData,
    isFormData: true,
  });
}
