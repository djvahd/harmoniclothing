/** Customer-side chat: thread list and message history/send for the ChatWidget. */
import { apiFetch } from "@/lib/api";
import type { ChatMessage, ChatThread } from "@/types/notification";

export function getThreads() {
  return apiFetch<{ data: ChatThread[] }>("/chat/threads");
}

export function getMessages(threadId: number) {
  return apiFetch<{ data: ChatMessage[] }>(`/chat/threads/${threadId}/messages`);
}

export function sendMessage(threadId: number, message: string) {
  return apiFetch<{ data: ChatMessage }>(`/chat/threads/${threadId}/messages`, {
    method: "POST",
    body: { message },
  });
}
