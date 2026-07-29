/** Server-side-only GET fetch for generateMetadata() — lib/api.ts's apiFetch() reads document.cookie, which doesn't exist during server rendering. */
import { API_URL } from "@/lib/api";

export async function fetchPublic<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}/api${path}`, { headers: { Accept: "application/json" } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
