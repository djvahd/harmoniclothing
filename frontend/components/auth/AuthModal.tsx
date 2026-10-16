"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAuthModalStore, type AuthModalView } from "@/store/auth-modal-store";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import LupaPasswordForm from "./LupaPasswordForm";

export default function AuthModal() {
  const t = useTranslations("auth.modal");
  const view = useAuthModalStore((state) => state.view);
  const message = useAuthModalStore((state) => state.message);
  const close = useAuthModalStore((state) => state.close);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Keep keyboard focus inside the modal: move it in on open, wrap Tab/Shift+Tab, give it back on close.
  useEffect(() => {
    if (!view) return;
    const opener = document.activeElement as HTMLElement | null;
    const focusable = () =>
      Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );
    if (!dialogRef.current?.contains(document.activeElement)) (focusable()[1] ?? focusable()[0])?.focus();
    function onTab(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      const items = focusable();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (!dialogRef.current?.contains(active)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onTab);
    return () => {
      document.removeEventListener("keydown", onTab);
      opener?.focus?.();
    };
  }, [view]);

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

  const titleKeys: Record<AuthModalView, string> = {
    login: "loginTitle",
    register: "registerTitle",
    "lupa-password": "forgotPasswordTitle",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-black/45 p-4"
      onClick={close}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="relative flex w-full max-w-[420px] flex-col gap-5 rounded-lg border border-border bg-surface p-8 shadow-[0_4px_16px_0_rgba(0,0,0,0.15)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={close}
          aria-label={t("close")}
          className="absolute right-4 top-4 text-text-secondary transition-colors hover:text-text-primary"
        >
          <X className="size-5" />
        </button>
        <h1 id="auth-modal-title" className="pr-6 font-heading text-h3 font-semibold text-text-primary">{t(titleKeys[view])}</h1>
        {view === "login" && <LoginForm message={message} />}
        {view === "register" && <RegisterForm />}
        {view === "lupa-password" && <LupaPasswordForm />}
      </div>
    </div>
  );
}
