export type UserRole = "customer" | "admin";
/** Effective role shown in the admin user list (a creator is a `customer` account with a creator profile). */
export type UserListRole = UserRole | "creator";
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
  /** Only on GET /admin/users: status of the creator profile, null when the user has none. */
  creator_status?: string | null;
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
