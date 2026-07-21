"use client";

import useSWR from "swr";
import AdminSidebar from "@/components/layout/AdminSidebar";
import SidebarPageShell from "@/components/layout/SidebarPageShell";
import Badge from "@/components/ui/Badge";
import { getUsers } from "@/services/admin";

export default function KelolaPenggunaPage() {
  const { data, isLoading } = useSWR("/admin/users", () => getUsers());
  const users = data?.data ?? [];

  return (
    <SidebarPageShell sidebar={<AdminSidebar />}>
      <div className="flex flex-col gap-6">
        <h1 className="font-heading text-h3 font-semibold text-text-primary">
          Kelola User & Creator
        </h1>
        <div className="overflow-x-auto rounded-md border border-border bg-surface">
          <table className="w-full text-left font-body text-sm">
            <thead className="border-b border-border text-text-secondary">
              <tr>
                <th className="p-4">Nama</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td className="p-4 text-text-secondary" colSpan={4}>
                    Memuat pengguna...
                  </td>
                </tr>
              )}
              {users.map((user) => (
                <tr key={user.id} className="border-b border-border last:border-0">
                  <td className="p-4 font-medium text-text-primary">{user.name}</td>
                  <td className="p-4 text-text-secondary">{user.email}</td>
                  <td className="p-4 text-text-secondary">{user.role}</td>
                  <td className="p-4">
                    <Badge variant={user.status === "aktif" ? "success" : "danger"}>
                      {user.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SidebarPageShell>
  );
}
