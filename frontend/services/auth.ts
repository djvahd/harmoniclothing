/** Session auth: login/register/logout, current-user lookup, and password reset. */
import { apiFetch } from "@/lib/api";
import type { LoginPayload, RegisterPayload, User } from "@/types/user";

export function login(payload: LoginPayload) {
  return apiFetch<{ data: { user: User } }>("/auth/login", {
    method: "POST",
    body: payload,
  });
}

export function register(payload: RegisterPayload) {
  return apiFetch<{ data: { id: number; name: string; email: string } }>(
    "/auth/register",
    { method: "POST", body: payload },
  );
}

export function logout() {
  return apiFetch<{ data: null }>("/auth/logout", { method: "POST" });
}

export function me() {
  return apiFetch<{ data: User }>("/me");
}

export function forgotPassword(email: string) {
  return apiFetch<{ data: null }>("/auth/forgot-password", {
    method: "POST",
    body: { email },
  });
}

export function resetPassword(payload: {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}) {
  return apiFetch<{ data: null }>("/auth/reset-password", {
    method: "POST",
    body: payload,
  });
}
