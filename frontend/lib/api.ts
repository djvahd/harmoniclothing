// In a deployed build the browser always talks to its own origin: next.config.mjs
// rewrites /api, /sanctum, /broadcasting and /storage to the backend so the
// Sanctum session/CSRF cookies stay first-party. NEXT_PUBLIC_API_URL is only for
// local dev, where the frontend (:3000) and backend (:8000) are separate origins
// with no proxy — set it in .env.local there. Baking it into a proxied deploy
// pins every client request to one hostname and breaks them all after a domain
// change (see DEPLOYMENT.md). SSR falls through to "" (relative) — server-only
// metadata fetches degrade gracefully; set NEXT_PUBLIC_API_URL in the deploy if
// server-rendered SEO metadata matters.
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" ? window.location.origin : "");

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(status: number, message: string, errors?: Record<string, string[]>) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

export function readCookie(name: string): string | null {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=").slice(1).join("=")) : null;
}

export async function ensureCsrfCookie(force = false) {
  if (!force && readCookie("XSRF-TOKEN")) return;
  await fetch(`${API_URL}/sanctum/csrf-cookie`, { credentials: "include" });
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  isFormData?: boolean;
};

export async function apiFetch<T>(
  path: string,
  { method = "GET", body, isFormData = false }: RequestOptions = {},
): Promise<T> {
  if (method !== "GET") {
    await ensureCsrfCookie();
  }

  const send = () => {
    const headers: Record<string, string> = {
      Accept: "application/json",
      // Backend's ResolvesLocale trait picks name_id/name_en etc. from this
      // when no `?lang=` query param is given (5.3_API_Specification.md §8).
      "Accept-Language": readCookie("NEXT_LOCALE") === "en" ? "en" : "id",
    };
    if (!isFormData) headers["Content-Type"] = "application/json";
    const xsrfToken = readCookie("XSRF-TOKEN");
    if (xsrfToken) headers["X-XSRF-TOKEN"] = xsrfToken;

    return fetch(`${API_URL}/api${path}`, {
      method,
      credentials: "include",
      headers,
      body: body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body),
    });
  };

  let res = await send();

  // A 419 means the XSRF-TOKEN cookie we sent is stale — a server session that
  // expired (or was swept), a previous deploy, or a token carried over from the
  // old domain. ensureCsrfCookie() skips the refresh whenever any XSRF-TOKEN
  // cookie exists, so a stale one would wedge every write until it's manually
  // cleared. Force a fresh token and replay the request once.
  if (res.status === 419) {
    await ensureCsrfCookie(true);
    res = await send();
  }

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(res.status, data?.message ?? "Terjadi kesalahan", data?.errors);
  }

  return data as T;
}

export function getErrorMessage(err: unknown, fallback: string): string {
  return err instanceof ApiError ? err.message : fallback;
}
