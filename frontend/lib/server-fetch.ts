/** Server-side-only GET fetch for generateMetadata() — lib/api.ts's apiFetch() reads document.cookie, which doesn't exist during server rendering. */
import { API_URL } from "@/lib/api";

/**
 * True only when the backend answers a definitive 404. Network failures and 5xx are NOT "missing"
 * (the client component shows a retry state for those), so a backend outage cannot turn every
 * detail page into a 404.
 */
export async function isMissing(path: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/api${path}`, { headers: { Accept: "application/json" } });
    return res.status === 404;
  } catch {
    return false;
  }
}

export async function fetchPublic<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}/api${path}`, { headers: { Accept: "application/json" } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
