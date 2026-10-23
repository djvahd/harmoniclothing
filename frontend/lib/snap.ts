/**
 * Opens the Midtrans Snap popup on top of our own page instead of sending the
 * user away. The backend only stores the Snap redirect URL, whose last path
 * segment is the Snap token, so no API change is needed. Without a client key
 * (or if snap.js cannot load) it falls back to the plain redirect.
 */

interface SnapCallbacks {
  onSuccess?: () => void;
  onPending?: () => void;
  onError?: () => void;
  onClose?: () => void;
}

declare global {
  interface Window {
    snap?: { pay: (token: string, callbacks: SnapCallbacks) => void };
  }
}

const CLIENT_KEY = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;

let loading: Promise<void> | null = null;

function loadSnapScript(origin: string): Promise<void> {
  if (window.snap) return Promise.resolve();
  loading ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `${origin}/snap/snap.js`;
    script.dataset.clientKey = CLIENT_KEY ?? "";
    script.onload = () => resolve();
    script.onerror = () => {
      loading = null;
      reject(new Error("snap.js failed to load"));
    };
    document.head.appendChild(script);
  });
  return loading;
}

/** Runs `onDone` whenever the popup ends (paid, pending, failed or closed). */
export async function payWithSnap(redirectUrl: string, onDone: () => void): Promise<void> {
  try {
    const url = new URL(redirectUrl);
    const token = url.pathname.split("/").filter(Boolean).pop();
    if (!CLIENT_KEY || !token) throw new Error("snap popup unavailable");

    await loadSnapScript(url.origin);
    window.snap!.pay(token, {
      onSuccess: onDone,
      onPending: onDone,
      onError: onDone,
      onClose: onDone,
    });
  } catch {
    window.location.href = redirectUrl;
  }
}
