import { create } from "zustand";
import * as authService from "@/services/auth";
import type { User } from "@/types/user";

interface AuthState {
  user: User | null;
  status: "idle" | "loading" | "ready";
  fetchMe: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: "idle",

  fetchMe: async () => {
    set({ status: "loading" });
    try {
      const { data } = await authService.me();
      set({ user: data, status: "ready" });
    } catch {
      set({ user: null, status: "ready" });
    }
  },

  login: async (email, password) => {
    const { data } = await authService.login({ email, password });
    set({ user: data.user, status: "ready" });
  },

  logout: async () => {
    await authService.logout();
    set({ user: null, status: "ready" });
  },

  setUser: (user) => set({ user }),
}));
