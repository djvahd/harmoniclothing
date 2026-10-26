"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { Send } from "lucide-react";
import { useTranslations } from "next-intl";
import AdminSidebar from "@/components/layout/AdminSidebar";
import SidebarPageShell from "@/components/layout/SidebarPageShell";
import {
  getAdminChatMessages,
  getAdminChatThreads,
  sendAdminChatMessage,
} from "@/services/admin";
import { getEcho } from "@/lib/echo";

const POLL_MS = 10000;

interface PusherConnection {
  state: string;
  bind: (event: string, cb: () => void) => void;
  unbind: (event: string, cb: () => void) => void;
}

export default function AdminChatManagementPage() {
  const t = useTranslations("admin.chat");
  const [connected, setConnected] = useState(true);
  const { data: threadsData, mutate: mutateThreads } = useSWR("/admin/chat/threads", getAdminChatThreads, {
    refreshInterval: POLL_MS,
  });
  const threads = threadsData?.data ?? [];
  const [activeId, setActiveId] = useState<number | null>(null);
  const activeThread = activeId ?? threads[0]?.id ?? null;

  const { data: messagesData, mutate } = useSWR(
    activeThread ? `/admin/chat/threads/${activeThread}/messages` : null,
    () => getAdminChatMessages(activeThread as number),
    { refreshInterval: POLL_MS },
  );
  const messages = messagesData?.data ?? [];
  const [draft, setDraft] = useState("");

  // Reverb being down must not freeze the inbox: SWR polls as a fallback and
  // the banner below tells the admin why updates are slower.
  useEffect(() => {
    const connection = (getEcho().connector as { pusher?: { connection?: PusherConnection } }).pusher
      ?.connection;
    if (!connection) return;
    const sync = () => setConnected(connection.state === "connected" || connection.state === "connecting");
    sync();
    connection.bind("state_change", sync);
    return () => connection.unbind("state_change", sync);
  }, []);

  useEffect(() => {
    getEcho().private("admin.chat").listen(".chat.message.sent", () => mutateThreads());
    return () => {
      getEcho().leave("admin.chat");
    };
  }, [mutateThreads]);

  useEffect(() => {
    if (!activeThread) return;
    const channelName = `chat.${activeThread}`;
    getEcho().private(channelName).listen(".chat.message.sent", () => mutate());
    return () => {
      getEcho().leave(channelName);
    };
  }, [activeThread, mutate]);

  async function handleSend() {
    if (!activeThread || !draft.trim()) return;
    await sendAdminChatMessage(activeThread, draft.trim());
    setDraft("");
    mutate();
  }

  return (
    <SidebarPageShell sidebar={<AdminSidebar />}>
      <div className="flex flex-col gap-6">
        <h1 className="font-heading text-h3 font-semibold text-text-primary">
          {t("title")}
        </h1>
        {!connected && (
          <p role="status" className="rounded-sm bg-accent/10 px-3 py-2 font-body text-xs text-text-primary">
            {t("offline")}
          </p>
        )}
        <div className="flex flex-col gap-4 lg:flex-row">
          <div
            role="group"
            aria-label={t("threadsLabel")}
            className="flex w-full shrink-0 flex-col gap-1 lg:w-64 rounded-md border border-border bg-surface p-2">
            {threads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => setActiveId(thread.id)}
                aria-current={activeThread === thread.id ? "true" : undefined}
                className={
                  activeThread === thread.id
                    ? "rounded-sm bg-accent/10 px-3 py-2 text-left font-body text-sm font-semibold text-accent"
                    : "rounded-sm px-3 py-2 text-left font-body text-sm text-text-primary hover:bg-background"
                }
              >
                {thread.customer.name}
              </button>
            ))}
            {threads.length === 0 && (
              <p className="p-3 font-body text-xs text-text-secondary">{t("noConversations")}</p>
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-2 rounded-md border border-border bg-surface p-4">
            <div
              role="log"
              aria-live="polite"
              aria-label={t("messagesLabel")}
              className="flex flex-1 flex-col gap-2 overflow-y-auto"
              style={{ minHeight: 300 }}>
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={
                    m.sender_role === "admin"
                      ? "max-w-[80%] self-end break-words [overflow-wrap:anywhere] rounded-md bg-accent px-3 py-2 font-body text-sm text-text-on-accent"
                      : "max-w-[80%] self-start break-words [overflow-wrap:anywhere] rounded-md bg-background px-3 py-2 font-body text-sm text-text-primary"
                  }
                >
                  {m.message}
                </div>
              ))}
            </div>
            {activeThread && (
              <div className="flex items-center gap-2 border-t border-border pt-3">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder={t("replyPlaceholder")}
                  aria-label={t("replyLabel")}
                  className="min-w-0 flex-1 rounded-sm border border-border bg-surface px-3 py-2 font-body text-sm outline-none"
                />
                <button type="button" onClick={handleSend} aria-label={t("sendLabel")} className="shrink-0 text-primary">
                  <Send className="size-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </SidebarPageShell>
  );
}
