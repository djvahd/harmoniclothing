import AppShell from "@/components/layout/AppShell";
import CreatorGuard from "@/components/auth/CreatorGuard";

export default function CreatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <CreatorGuard>
      <AppShell>{children}</AppShell>
    </CreatorGuard>
  );
}
