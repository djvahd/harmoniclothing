const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(status: number, message: string, errors?: Record<string, string[]>) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

function readCookie(name: string): string | null {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=").slice(1).join("=")) : null;
}

async function ensureCsrfCookie() {
  if (readCookie("XSRF-TOKEN")) return;
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

  const headers: Record<string, string> = {
    Accept: "application/json",
    // Backend's ResolvesLocale trait picks name_id/name_en etc. from this
    // when no `?lang=` query param is given (5.3_API_Specification.md §8).
    "Accept-Language": readCookie("NEXT_LOCALE") === "en" ? "en" : "id",
  };
  if (!isFormData) headers["Content-Type"] = "application/json";
  const xsrfToken = readCookie("XSRF-TOKEN");
  if (xsrfToken) headers["X-XSRF-TOKEN"] = xsrfToken;

  const res = await fetch(`${API_URL}/api${path}`, {
    method,
    credentials: "include",
    headers,
    body: body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body),
  });

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(res.status, data?.message ?? "Terjadi kesalahan", data?.errors);
  }

  return data as T;
}
