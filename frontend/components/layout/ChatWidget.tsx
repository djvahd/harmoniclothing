"use client";

import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { ChevronDown, MessageCircle, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { getMessages, getThreads, sendMessage } from "@/services/chat";
import { useAuthStore } from "@/store/auth-store";
import { useRealtimeNotifications } from "@/hooks/useNotifications";
import { getEcho } from "@/lib/echo";

export default function ChatWidget() {
  const t = useTranslations("layout.chatWidget");
  const user = useAuthStore((state) => state.user);
  useRealtimeNotifications(user?.id);
  const [phase, setPhase] = useState<"closed" | "opening" | "open" | "closing">("closed");
  const [draft, setDraft] = useState("");
  const transitionTimeout = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(transitionTimeout.current), []);

  function openPanel() {
    setPhase("opening");
    transitionTimeout.current = setTimeout(() => setPhase("open"), 160);
  }

  function closePanel() {
    setPhase("closing");
    transitionTimeout.current = setTimeout(() => setPhase("closed"), 160);
  }

  const panelMounted = phase === "open" || phase === "closing";
  const { data: threadsData } = useSWR(panelMounted && user ? "/chat/threads" : null, getThreads);
  const thread = threadsData?.data?.[0];
  const { data: messagesData, mutate } = useSWR(
    thread ? `/chat/threads/${thread.id}/messages` : null,
    () => getMessages(thread!.id),
  );
  const messages = messagesData?.data ?? [];

  useEffect(() => {
    if (!thread) return;
    const channelName = `chat.${thread.id}`;
    getEcho().private(channelName).listen(".chat.message.sent", () => mutate());
    return () => {
      getEcho().leave(channelName);
    };
  }, [thread, mutate]);

  async function handleSend() {
    if (!thread || !draft.trim()) return;
    await sendMessage(thread.id, draft.trim());
    setDraft("");
    mutate();
  }

  if (!user) return null;

  return (
    <div className="fixed bottom-10 right-10 z-40">
      {panelMounted && (
        <div
          className={`flex h-[380px] w-[340px] flex-col overflow-hidden rounded-md border border-border bg-surface shadow-lg ${
            phase === "closing" ? "animate-fade-pop-out" : "animate-fade-pop-in"
          }`}
        >
          <button
            type="button"
            onClick={closePanel}
            aria-label={t("collapseAria")}
            className="flex w-full items-center justify-between bg-primary px-4 py-3"
          >
            <p className="font-body text-sm font-semibold text-text-on-accent">
              {t("title")}
            </p>
            <ChevronDown className="size-4 text-text-on-accent" />
          </button>
          <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={
                  m.sender_role === "admin"
                    ? "self-start rounded-md bg-background px-3 py-2 font-body text-sm text-text-primary"
                    : "self-end rounded-md bg-accent px-3 py-2 font-body text-sm text-text-on-accent"
                }
              >
                {m.message}
              </div>
            ))}
            {messages.length === 0 && (
              <p className="font-body text-xs text-text-secondary">{t("empty")}</p>
            )}
          </div>
          <div className="flex items-center gap-2 border-t border-border p-3">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={t("placeholder")}
              className="flex-1 rounded-sm border border-border bg-surface px-3 py-2 font-body text-sm outline-none"
            />
            <button onClick={handleSend} aria-label={t("sendAria")} className="text-primary">
              <Send className="size-4" />
            </button>
          </div>
        </div>
      )}

      {(phase === "closed" || phase === "opening") && (
        <button
          onClick={openPanel}
          aria-label={t("openAria")}
          className={`flex items-center gap-2 rounded-full bg-surface py-3 pl-3 pr-5 shadow-lg ${
            phase === "opening" ? "animate-fade-pop-out" : "animate-fade-pop-in"
          }`}
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-accent">
            <MessageCircle className="size-4 text-text-on-accent" />
          </span>
          <span className="font-body text-sm font-semibold text-accent">{t("openLabel")}</span>
        </button>
      )}
    </div>
  );
}
