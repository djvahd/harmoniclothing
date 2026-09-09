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
 * Lazily creates the shared Reverb/Echo client. Uses a custom authorizer
 * (not Echo's default axios one) so private-channel auth rides the same
 * Sanctum session cookie + XSRF header as every other request in lib/api.ts,
 * instead of an unauthenticated request that routes/channels.php would reject.
 */
export function getEcho(): Echo<"reverb"> {
  if (echo) return echo;

  if (typeof window !== "undefined") {
    window.Pusher = Pusher;
  }

  echo = new Echo({
    broadcaster: "reverb",
    key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
    wsHost: process.env.NEXT_PUBLIC_REVERB_HOST,
    wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 8080),
    wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 8080),
    forceTLS: process.env.NEXT_PUBLIC_REVERB_SCHEME === "https",
    enabledTransports: ["ws", "wss"],
    authorizer: (channel: { name: string }) => ({
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
    }),
  });

  return echo;
}
