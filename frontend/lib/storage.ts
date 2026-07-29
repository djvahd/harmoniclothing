import { API_URL } from "@/lib/api";

export function storageUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (path.startsWith("http")) return path;
  return `${API_URL}/storage/${path}`;
}
