const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export function storageUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (path.startsWith("http")) return path;
  return `${API_URL}/storage/${path}`;
}
