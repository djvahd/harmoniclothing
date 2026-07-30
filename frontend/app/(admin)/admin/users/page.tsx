"use client";

import { useState } from "react";
import useSWR from "swr";
import { Users } from "lucide-react";
import { useTranslations } from "next-intl";
import AdminSidebar from "@/components/layout/AdminSidebar";
import SidebarPageShell from "@/components/layout/SidebarPageShell";
import Badge from "@/components/ui/Badge";
import DataTable from "@/components/ui/DataTable";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import { getUsers } from "@/services/admin";
import type { User } from "@/types/user";

export default function KelolaPenggunaPage() {
  const t = useTranslations("admin.users");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useSWR(["/admin/users", page], () => getUsers({ page }));
  const users = data?.data ?? [];

  return (
    <SidebarPageShell sidebar={<AdminSidebar />}>
      <div className="flex flex-col gap-6">
        <h1 className="font-heading text-h3 font-semibold text-text-primary">
          {t("title")}
        </h1>
        <DataTable<User>
          columns={[
            { key: "name", header: t("columns.name") },
            { key: "email", header: t("columns.email") },
            { key: "role", header: t("columns.role") },
            { key: "status", header: t("columns.status") },
          ]}
          data={users}
          isLoading={isLoading}
          getRowKey={(user) => user.id}
          emptyState={
            <EmptyState icon={Users} title={t("empty")} />
          }
          renderRow={(user) => (
            <tr className="border-b border-border last:border-0">
              <td className="p-4 font-medium text-text-primary">{user.name}</td>
              <td className="p-4 text-text-secondary">{user.email}</td>
              <td className="p-4 text-text-secondary">{user.role}</td>
              <td className="p-4">
                <Badge variant={user.status === "aktif" ? "success" : "danger"}>
                  {user.status}
                </Badge>
              </td>
            </tr>
          )}
        />
        {data?.meta && <Pagination meta={data.meta} onPageChange={setPage} />}
      </div>
    </SidebarPageShell>
  );
}
