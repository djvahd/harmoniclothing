"use client";

import { createPortal } from "react-dom";

/** Renders children into document.body so a modal is never trapped in a parent's stacking context. */
export default function Portal({ children }: { children: React.ReactNode }) {
  if (typeof document === "undefined") return null;
  return createPortal(children, document.body);
}
