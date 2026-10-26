import { useEffect, useRef } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Keeps Tab/Shift+Tab inside a modal while `active`, and returns focus to the element that
 * opened it on close. Attach the returned ref to the dialog element (it gets `tabIndex={-1}`).
 */
export function useFocusTrap<T extends HTMLElement>(active: boolean) {
  const ref = useRef<T>(null);
  const trigger = useRef<HTMLElement | null>(null);

  // Captured during the render that opens the modal: the trigger is still focused then,
  // before the dialog's own autoFocus runs.
  if (active && trigger.current === null && typeof document !== "undefined") {
    trigger.current = document.activeElement as HTMLElement | null;
  }

  useEffect(() => {
    if (!active) return;
    const dialog = ref.current;
    if (dialog && !dialog.contains(document.activeElement)) dialog.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Tab" || !dialog) return;
      const items = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const current = document.activeElement;
      if (e.shiftKey && (current === first || !dialog.contains(current))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (current === last || !dialog.contains(current))) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      trigger.current?.focus?.();
      trigger.current = null;
    };
  }, [active]);

  return ref;
}
