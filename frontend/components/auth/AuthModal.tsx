"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { useAuthModalStore, type AuthModalView } from "@/store/auth-modal-store";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import LupaPasswordForm from "./LupaPasswordForm";

const TITLES: Record<AuthModalView, string> = {
  login: "Masuk ke Akun",
  register: "Buat Akun Baru",
  "lupa-password": "Lupa Password",
};

export default function AuthModal() {
  const view = useAuthModalStore((state) => state.view);
  const message = useAuthModalStore((state) => state.message);
  const close = useAuthModalStore((state) => state.close);

  useEffect(() => {
    if (!view) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKeyDown);
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [view, close]);

  if (!view) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
      onClick={close}
    >
      <div
        className="relative flex w-full max-w-[420px] flex-col gap-5 rounded-lg border border-border bg-surface p-8 shadow-[0_4px_16px_0_rgba(0,0,0,0.15)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={close}
          aria-label="Tutup"
          className="absolute right-4 top-4 text-text-secondary transition-colors hover:text-text-primary"
        >
          <X className="size-5" />
        </button>
        <h1 className="pr-6 font-heading text-h3 font-semibold text-text-primary">{TITLES[view]}</h1>
        {view === "login" && <LoginForm message={message} />}
        {view === "register" && <RegisterForm />}
        {view === "lupa-password" && <LupaPasswordForm />}
      </div>
    </div>
  );
}
