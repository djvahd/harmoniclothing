import Echo from "laravel-echo";
import Pusher from "pusher-js";
import { API_URL, ensureCsrfCookie, readCookie } from "@/lib/api";

declare global {
  interface Window {
    Pusher: typeof Pusher;
  }
}

let echo: Echo<"reverb"> | null = null;

/**
 * Lazily creates the shared Echo client. Uses a custom authorizer (not
 * Echo's default axios one) so private-channel auth rides the same Sanctum
 * session cookie + XSRF header as every other request in lib/api.ts, instead
 * of an unauthenticated request that routes/channels.php would reject.
 *
 * Picks Pusher's hosted service when NEXT_PUBLIC_PUSHER_APP_KEY is set,
 * self-hosted Reverb otherwise — the only difference between deployments is
 * which env vars are filled in (see .env.example / DEPLOYMENT.md), no code
 * change needed to switch back to Reverb once a VPS can run it again.
 */
export function getEcho(): Echo<"reverb"> {
  if (echo) return echo;

  if (typeof window !== "undefined") {
    window.Pusher = Pusher;
  }

  const authorizer = (channel: { name: string }) => ({
    authorize: async (
      socketId: string,
      callback: (error: Error | null, authData: { auth: string; channel_data?: string } | null) => void,
    ) => {
      try {
        const authFetch = () =>
          fetch(`${API_URL}/broadcasting/auth`, {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              "X-XSRF-TOKEN": readCookie("XSRF-TOKEN") ?? "",
            },
            body: JSON.stringify({ socket_id: socketId, channel_name: channel.name }),
          });

        await ensureCsrfCookie();
        let res = await authFetch();
        // Stale CSRF cookie — force a fresh one and retry once (see lib/api.ts).
        if (res.status === 419) {
          await ensureCsrfCookie(true);
          res = await authFetch();
        }
        if (!res.ok) throw new Error(`Channel auth failed (${res.status})`);
        callback(null, await res.json());
      } catch (err) {
        callback(err instanceof Error ? err : new Error("Channel auth failed"), null);
      }
    },
  });

  const pusherKey = process.env.NEXT_PUBLIC_PUSHER_APP_KEY;

  const options = pusherKey
    ? {
        broadcaster: "pusher" as const,
        key: pusherKey,
        cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER,
        forceTLS: true,
        enabledTransports: ["ws", "wss"],
        authorizer,
      }
    : {
        broadcaster: "reverb" as const,
        key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
        wsHost: process.env.NEXT_PUBLIC_REVERB_HOST,
        wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 8080),
        wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 8080),
        forceTLS: process.env.NEXT_PUBLIC_REVERB_SCHEME === "https",
        enabledTransports: ["ws", "wss"],
        authorizer,
      };

  // laravel-echo's per-broadcaster option types don't unify cleanly; both
  // shapes are valid at runtime.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  echo = new Echo(options as any);

  return echo;
}
