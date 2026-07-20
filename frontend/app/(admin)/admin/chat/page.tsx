"use client";

import { useState } from "react";
import useSWR from "swr";
import { Send } from "lucide-react";
import AdminSidebar from "@/components/layout/AdminSidebar";
import SidebarPageShell from "@/components/layout/SidebarPageShell";
import {
  getAdminChatMessages,
  getAdminChatThreads,
  sendAdminChatMessage,
} from "@/services/admin";

export default function AdminChatManagementPage() {
  const { data: threadsData } = useSWR("/admin/chat/threads", getAdminChatThreads);
  const threads = threadsData?.data ?? [];
  const [activeId, setActiveId] = useState<number | null>(null);
  const activeThread = activeId ?? threads[0]?.id ?? null;

  const { data: messagesData, mutate } = useSWR(
    activeThread ? `/admin/chat/threads/${activeThread}/messages` : null,
    () => getAdminChatMessages(activeThread as number),
  );
  const messages = messagesData?.data ?? [];
  const [draft, setDraft] = useState("");

  async function handleSend() {
    if (!activeThread || !draft.trim()) return;
    await sendAdminChatMessage(activeThread, draft.trim());
    setDraft("");
    mutate();
  }

  return (
    <SidebarPageShell sidebar={<AdminSidebar />}>
      <div className="flex flex-col gap-6">
        <h1 className="font-heading text-2xl font-semibold text-text-primary">
          Chat Management
        </h1>
        <div className="flex gap-4">
          <div className="flex w-64 shrink-0 flex-col gap-1 rounded-md border border-border bg-surface p-2">
            {threads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => setActiveId(thread.id)}
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
              <p className="p-3 font-body text-xs text-text-secondary">Belum ada percakapan.</p>
            )}
          </div>

          <div className="flex flex-1 flex-col gap-2 rounded-md border border-border bg-surface p-4">
            <div className="flex flex-1 flex-col gap-2 overflow-y-auto" style={{ minHeight: 300 }}>
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={
                    m.sender_role === "admin"
                      ? "self-end rounded-md bg-accent px-3 py-2 font-body text-sm text-text-on-accent"
                      : "self-start rounded-md bg-background px-3 py-2 font-body text-sm text-text-primary"
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
                  placeholder="Balas pesan..."
                  className="flex-1 rounded-sm border border-border bg-surface px-3 py-2 font-body text-sm outline-none"
                />
                <button onClick={handleSend} className="text-primary">
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
