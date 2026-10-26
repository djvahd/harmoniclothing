import { getTranslations } from "next-intl/server";
import SiteHeader from "@/components/layout/SiteHeader";
import Footer from "@/components/layout/Footer";
import ChatWidget from "@/components/layout/ChatWidget";

export default async function AppShell({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("common");
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-surface focus:px-4 focus:py-2 focus:font-body focus:text-sm focus:font-medium focus:text-primary focus:shadow-lg"
      >
        {t("skipToContent")}
      </a>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">{children}</main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
