export interface AppNotification {
  id: number;
  type: string;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

export interface ChatThread {
  id: number;
  assigned_admin_id: number | null;
  last_message_at: string | null;
  customer?: { id: number; name: string };
}

export interface ChatMessage {
  id: number;
  sender_role: "customer" | "admin";
  sender_name: string;
  message: string;
  is_read: boolean;
  created_at: string;
}
