import { create } from "zustand";
import * as authService from "@/services/auth";
import { ApiError } from "@/lib/api";
import type { User } from "@/types/user";

interface AuthState {
  user: User | null;
  status: "idle" | "loading" | "ready";
  fetchMe: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

// Remembers that the last session check came back 401, so later page loads of a guest skip the
// /me request (which only shows up as a red console error). Cleared on login; any other state
// (first visit, returning member) still checks the server, so a real session is never missed.
const GUEST_HINT = "hc_guest";
const hint = {
  get: () => {
    try {
      return localStorage.getItem(GUEST_HINT) === "1";
    } catch {
      return false;
    }
  },
  set: (guest: boolean) => {
    try {
      if (guest) localStorage.setItem(GUEST_HINT, "1");
      else localStorage.removeItem(GUEST_HINT);
    } catch {}
  },
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: "idle",

  fetchMe: async () => {
    if (hint.get()) {
      set({ user: null, status: "ready" });
      return;
    }
    set({ status: "loading" });
    try {
      const { data } = await authService.me();
      set({ user: data, status: "ready" });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) hint.set(true);
      set({ user: null, status: "ready" });
    }
  },

  login: async (email, password) => {
    const { data } = await authService.login({ email, password });
    hint.set(false);
    set({ user: data.user, status: "ready" });
  },

  logout: async () => {
    await authService.logout();
    hint.set(true);
    set({ user: null, status: "ready" });
  },

  setUser: (user) => set({ user }),
}));
