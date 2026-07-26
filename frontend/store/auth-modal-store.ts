import { create } from "zustand";

export type AuthModalView = "login" | "register" | "lupa-password";

interface AuthModalState {
  view: AuthModalView | null;
  message: string | null;
  open: (view: AuthModalView, message?: string) => void;
  close: () => void;
}

export const useAuthModalStore = create<AuthModalState>((set) => ({
  view: null,
  message: null,
  open: (view, message) => set({ view, message: message ?? null }),
  close: () => set({ view: null, message: null }),
}));
