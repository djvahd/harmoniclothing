import Image from "next/image";
import Link from "next/link";
import { Home, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import SiteHeader from "@/components/layout/SiteHeader";
import Footer from "@/components/layout/Footer";
import ChatWidget from "@/components/layout/ChatWidget";
import Button from "@/components/ui/Button";

export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section
          className="relative overflow-hidden px-4 py-16 md:px-20"
          style={{
            background:
              "linear-gradient(to bottom, transparent 85%, #f8fafc 100%), linear-gradient(28deg, #f8fafc 25%, #eef6f3 64%, #e0f1ea 96%)",
          }}
        >
          <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-8 text-center lg:flex-row lg:justify-between lg:gap-12 lg:text-left">
            <div className="flex max-w-xl flex-col items-center gap-5 lg:items-start">
              <span className="font-heading text-[96px] font-semibold leading-none text-primary md:text-[140px]">
                404
              </span>
              <h1 className="font-heading text-h3 font-semibold text-text-primary md:text-h1">
                {t("title")}
              </h1>
              <p className="font-body text-base text-text-secondary">
                {t("description")}
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/">
                  <Button variant="primary" className="gap-2">
                    <Home className="size-4" />
                    {t("backHome")}
                  </Button>
                </Link>
                <Link href="/catalog">
                  <Button variant="secondary" className="gap-2">
                    <Search className="size-4" />
                    {t("viewCatalog")}
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative hidden h-[260px] w-[300px] shrink-0 lg:block">
              <div className="absolute left-1/2 top-0 h-[220px] w-[196px] -translate-x-1/2 rotate-[-8deg]">
                <Image
                  src="/hero/kaos.png"
                  alt={t("imageAlt")}
                  fill
                  sizes="196px"
                  className="object-contain opacity-80 drop-shadow-xl grayscale"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
