import AdminHeader from "@/components/layout/AdminHeader";
import AdminGuard from "@/components/auth/AdminGuard";

export const metadata = { robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="flex min-h-screen flex-col bg-background">
        <AdminHeader />
        <main className="flex-1">{children}</main>
      </div>
    </AdminGuard>
  );
}
