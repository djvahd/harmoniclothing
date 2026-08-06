# Logout Confirmation + Redirect to Home

**Date:** 2026-08-06
**Status:** Approved

## Problem

Currently, clicking "Keluar" (logout) anywhere in the app calls `logout()` from `useAuthStore` immediately, with no confirmation step. Post-logout behavior is inconsistent and mostly accidental:

- `SiteHeader.tsx` (desktop `AccountMenu`, mobile drawer): no redirect, page just re-renders with `user: null`.
- `AdminHeader.tsx`: no redirect.
- `SidebarNav.tsx` (creator/customer dashboards): no redirect.
- `CreatorGuard.tsx` is the only place that redirects (`router.replace("/")`), but only as a side effect of `user` becoming `null` while on a guarded creator route — not from a deliberate logout flow.

This means logging out from most pages leaves the user staring at a stale/loading view instead of landing somewhere sensible, and there's no "are you sure?" safety step.

## Goals

1. Every logout action (any role, any page) shows a confirmation popup ("Apakah Anda yakin ingin keluar?") before logging out.
2. On confirm, the user is logged out and redirected to the public homepage (`/`) — uniformly across customer, creator, and admin roles.
3. On cancel, nothing happens — dialog closes, user stays logged in on the current page.

## Non-goals

- Changing what `AuthGuard` / `AdminGuard` / `CreatorGuard` do when a session expires or is invalidated server-side (that's a separate "session expiry" concern, not a user-initiated logout).
- Building a general-purpose modal/dialog system — just enough reusable pieces to cover this case cleanly.

## Design

### 1. `ConfirmDialog` component

New file: `frontend/components/ui/ConfirmDialog.tsx`.

A simplified sibling of the existing `PromptModal.tsx`, reusing the same visual pattern (fixed overlay `bg-black/45`, centered `rounded-md bg-surface p-6` card, `Button` footer with secondary=cancel / primary=confirm) but without the text-input requirement `PromptModal` has.

Props:
```ts
{
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}
```

Behavior: Escape key and overlay click both trigger `onCancel` (matching `AuthModal.tsx`'s existing overlay-dismiss pattern). Body-scroll lock while open, matching `AuthModal.tsx`.

### 2. `useLogoutConfirm` hook

New file: `frontend/hooks/useLogoutConfirm.ts`.

```ts
function useLogoutConfirm() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

  const requestLogout = () => setConfirmOpen(true);
  const cancelLogout = () => setConfirmOpen(false);
  const confirmLogout = async () => {
    setConfirmOpen(false);
    await logout();
    router.push("/");
  };

  return { confirmOpen, requestLogout, confirmLogout, cancelLogout };
}
```

Centralizes the confirm → logout → redirect sequence so all call sites behave identically and there's a single place to change the redirect target later if ever needed.

### 3. Call site wiring

Each of the 4 existing logout triggers swaps its direct `logout()` call for `requestLogout()`, and renders one `<ConfirmDialog>` using the hook's state:

- `frontend/components/layout/SiteHeader.tsx` — desktop `AccountMenu` `onLogout` prop, mobile drawer logout button (share one hook instance since both live in the same component).
- `frontend/components/layout/AdminHeader.tsx` — logout button.
- `frontend/components/layout/SidebarNav.tsx` — logout button (used by both creator and customer dashboards).

`AccountMenu.tsx` itself doesn't change — it already just calls whatever `onLogout` prop it's given, so `SiteHeader` passing `requestLogout` instead of `logout` is transparent to it.

### 4. Copy / i18n

Add to `frontend/locales/id.json` and `frontend/locales/en.json`:

```json
"logoutConfirmTitle": "Konfirmasi Keluar" / "Confirm Logout",
"logoutConfirmMessage": "Apakah Anda yakin ingin keluar?" / "Are you sure you want to log out?",
"logoutConfirmConfirm": "Keluar" / "Log out",
"logoutConfirmCancel": "Batal" / "Cancel"
```

Reuse existing `t("logout")` key for trigger button labels (unchanged).

## Testing

- Manual verification in browser (dev server) for each of the 3 wired locations, across at least one role each (customer, creator, admin):
  - Click logout → dialog appears, page does not navigate yet.
  - Click Cancel / Escape / overlay → dialog closes, still logged in.
  - Click Confirm → dialog closes, session cleared, redirected to `/`.
- No new automated test infra proposed; this is a small UI flow change consistent with the project's existing manual-verification pattern for frontend work.
