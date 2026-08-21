export type UserRole = "customer" | "admin";
export type UserStatus = "aktif" | "nonaktif" | "banned";

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  photo_url: string | null;
  role: UserRole;
  status: UserStatus;
  email_verified_at: string | null;
}

export interface Address {
  id: number;
  label: string;
  recipient_name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  postal_code: string;
  address_line: string;
  is_default: boolean;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  privacy_accepted: boolean;
  terms_accepted: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}
