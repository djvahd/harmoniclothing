"use client";

import { useState } from "react";
import useSWR from "swr";
import { ChevronDown, MessageCircle, Send } from "lucide-react";
import { getMessages, getThreads, sendMessage } from "@/services/chat";
import { useAuthStore } from "@/store/auth-store";

export default function ChatWidget() {
  const user = useAuthStore((state) => state.user);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");

  const { data: threadsData } = useSWR(open && user ? "/chat/threads" : null, getThreads);
  const thread = threadsData?.data?.[0];
  const { data: messagesData, mutate } = useSWR(
    thread ? `/chat/threads/${thread.id}/messages` : null,
    () => getMessages(thread!.id),
  );
  const messages = messagesData?.data ?? [];

  async function handleSend() {
    if (!thread || !draft.trim()) return;
    await sendMessage(thread.id, draft.trim());
    setDraft("");
    mutate();
  }

  if (!user) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {open && (
        <div className="flex h-[380px] w-[340px] flex-col overflow-hidden rounded-md border border-border bg-surface shadow-lg">
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Ciutkan chat"
            className="flex w-full items-center justify-between bg-primary px-4 py-3"
          >
            <p className="font-body text-sm font-semibold text-text-on-accent">
              Chat dengan Admin
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
              <p className="font-body text-xs text-text-secondary">
                Mulai percakapan dengan tim Harmoni.
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 border-t border-border p-3">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Tulis pesan..."
              className="flex-1 rounded-sm border border-border bg-surface px-3 py-2 font-body text-sm outline-none"
            />
            <button onClick={handleSend} aria-label="Kirim pesan" className="text-primary">
              <Send className="size-4" />
            </button>
          </div>
        </div>
      )}

      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Buka chat"
          className="flex size-14 items-center justify-center rounded-full bg-accent shadow-lg"
        >
          <MessageCircle className="size-6 text-text-on-accent" />
        </button>
      )}
    </div>
  );
}
