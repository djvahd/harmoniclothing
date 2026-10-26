import AdminHeader from "@/components/layout/AdminHeader";
import { getTranslations } from "next-intl/server";
import AdminGuard from "@/components/auth/AdminGuard";

export const metadata = { robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("admin.sidebar");
  return (
    <AdminGuard>
      <div className="flex min-h-screen flex-col bg-background">
        <a
          href="#admin-main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-50 focus:rounded-sm focus:bg-surface focus:px-4 focus:py-2 focus:font-body focus:text-sm focus:text-text-primary"
        >
          {t("skipToContent")}
        </a>
        <AdminHeader />
        <main className="flex-1">{children}</main>
      </div>
    </AdminGuard>
  );
}
