"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { Search, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import AdminSidebar from "@/components/layout/AdminSidebar";
import SidebarPageShell from "@/components/layout/SidebarPageShell";
import Badge from "@/components/ui/Badge";
import DataTable from "@/components/ui/DataTable";
import EmptyState from "@/components/ui/EmptyState";
import Input from "@/components/ui/Input";
import Pagination from "@/components/ui/Pagination";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { getUsers, setUserStatus } from "@/services/admin";
import type { User, UserListRole, UserStatus } from "@/types/user";

const ROLES: UserListRole[] = ["customer", "creator", "admin"];
const STATUSES: UserStatus[] = ["aktif", "nonaktif", "banned"];
const SELECT_CLASS =
  "rounded-sm border border-border bg-surface px-3 py-2.5 font-body text-sm text-text-primary outline-none";

/** A creator is a `customer` account that owns a creator profile; the API role alone cannot tell them apart. */
function effectiveRole(user: User): UserListRole {
  return user.role === "customer" && user.creator_status ? "creator" : user.role;
}

export default function KelolaPenggunaPage() {
  const t = useTranslations("admin.users");
  const tCommon = useTranslations("common");
  const [target, setTarget] = useState<User | null>(null);
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const { data, isLoading } = useSWR(["/admin/users", page, roleFilter, statusFilter, search], () =>
    getUsers({ page, role: roleFilter || undefined, status: statusFilter || undefined, search: search || undefined }),
  );
  const users = data?.data ?? [];

  async function handleToggle() {
    if (!target) return;
    const user = target;
    setTarget(null);
    await setUserStatus(user.id, user.status === "aktif" ? "nonaktif" : "aktif");
    mutate((key) => Array.isArray(key) && key[0] === "/admin/users");
  }

  return (
    <SidebarPageShell sidebar={<AdminSidebar />}>
      <div className="flex flex-col gap-6">
        <h1 className="font-heading text-h3 font-semibold text-text-primary">
          {t("title")}
        </h1>
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setSearch(searchInput.trim());
          }}
        >
          <div className="min-w-60 flex-1">
            <Input
              icon={Search}
              type="search"
              aria-label={t("searchPlaceholder")}
              placeholder={t("searchPlaceholder")}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <select
            aria-label={t("columns.role")}
            value={roleFilter}
            onChange={(e) => {
              setPage(1);
              setRoleFilter(e.target.value);
            }}
            className={SELECT_CLASS}
          >
            <option value="">{t("roleAll")}</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>{t(`roles.${r}`)}</option>
            ))}
          </select>
          <select
            aria-label={t("columns.status")}
            value={statusFilter}
            onChange={(e) => {
              setPage(1);
              setStatusFilter(e.target.value);
            }}
            className={SELECT_CLASS}
          >
            <option value="">{t("statusAll")}</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{t(`statuses.${s}`)}</option>
            ))}
          </select>
        </form>
        <DataTable<User>
          columns={[
            { key: "name", header: t("columns.name") },
            { key: "email", header: t("columns.email") },
            { key: "role", header: t("columns.role") },
            { key: "status", header: t("columns.status") },
            { key: "actions", header: t("columns.actions") },
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
              <td className="p-4 text-text-secondary">{t(`roles.${effectiveRole(user)}`)}</td>
              <td className="p-4">
                <Badge variant={user.status === "aktif" ? "success" : user.status === "nonaktif" ? "neutral" : "danger"}>
                  {t(`statuses.${user.status}`)}
                </Badge>
              </td>
              <td className="p-4">
                {user.role !== "admin" && user.status !== "banned" && (
                  <Button variant="secondary" onClick={() => setTarget(user)}>
                    {user.status === "aktif" ? t("deactivate") : t("activate")}
                  </Button>
                )}
              </td>
            </tr>
          )}
        />
        {data?.meta && <Pagination meta={data.meta} onPageChange={setPage} />}
      </div>
      <ConfirmDialog
        open={target !== null}
        title={target?.status === "aktif" ? t("deactivateConfirmTitle") : t("activateConfirmTitle")}
        message={t(target?.status === "aktif" ? "deactivateConfirmMessage" : "activateConfirmMessage", { name: target?.name ?? "" })}
        confirmLabel={target?.status === "aktif" ? t("deactivate") : t("activate")}
        cancelLabel={tCommon("cancel")}
        onConfirm={handleToggle}
        onCancel={() => setTarget(null)}
      />
    </SidebarPageShell>
  );
}
