import AppShell from "@/components/layout/AppShell";
import CreatorGuard from "@/components/auth/CreatorGuard";

export const metadata = { robots: { index: false, follow: false } };

export default function CreatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <CreatorGuard>
      <AppShell>{children}</AppShell>
    </CreatorGuard>
  );
}
