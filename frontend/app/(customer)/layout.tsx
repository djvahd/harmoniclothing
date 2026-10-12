import AppShell from "@/components/layout/AppShell";
import AuthGuard from "@/components/auth/AuthGuard";

export const metadata = { robots: { index: false, follow: false } };

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <AuthGuard>{children}</AuthGuard>
    </AppShell>
  );
}
