import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import DesignCard, { DesignCardSkeleton } from "@/components/ui/DesignCard";
import InlineError from "@/components/ui/InlineError";
import Reveal from "@/components/ui/Reveal";
import { useDesigns } from "@/hooks/useDesigns";

/** The horizontally-scrolling "Desain Populer" teaser row, linking out to the full marketplace. */
export default function PopularDesignsSection() {
  const t = useTranslations("home.popularDesigns");
  const { data, isLoading, error } = useDesigns("home", { per_page: 8 });
  const designs = data?.data ?? [];

  return (
    <section className="px-4 py-16 md:px-20">
      <Reveal className="mx-auto flex w-full max-w-[1440px] flex-col gap-6">
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-1">
            <p className="font-body text-caption font-bold uppercase tracking-[0.6px] text-primary">
              {t("eyebrow")}
            </p>
            <h2 className="font-heading text-h3 font-semibold text-text-primary md:text-h2">
              {t("title")}
            </h2>
          </div>
          <Link href="/marketplace" className="shrink-0 font-body text-sm font-medium text-primary transition-colors hover:text-accent hover:underline hover:underline-offset-4">
            {t("viewAll")}
          </Link>
        </div>
        {!isLoading && error && <InlineError />}
        {(isLoading || (!error && designs.length === 0)) && (
          <div className="relative overflow-hidden">
            <div className="flex items-center gap-6 overflow-x-hidden pb-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="shrink-0">
                  <DesignCardSkeleton />
                </div>
              ))}
            </div>
          </div>
        )}
        {!isLoading && designs.length > 0 && (
          <div className="relative overflow-hidden">
            <div className="flex snap-x gap-6 overflow-x-auto pb-2 [mask-image:linear-gradient(to_right,black_92%,transparent_100%)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {designs.map((design) => (
                <div key={design.id} className="flex shrink-0 snap-start">
                  <DesignCard design={design} />
                </div>
              ))}
              <Link
                href="/marketplace?sort=populer"
                aria-label={t("viewAllAria")}
                className="flex size-11 shrink-0 snap-start items-center justify-center rounded-full border border-border bg-surface text-text-primary transition-all duration-150 hover:-translate-y-0.5 hover:border-primary hover:bg-primary hover:text-text-on-accent hover:shadow-md active:translate-y-0 active:scale-95"
              >
                <ArrowRight className="size-5" />
              </Link>
              <div className="w-10 shrink-0" aria-hidden="true" />
            </div>
          </div>
        )}
      </Reveal>
    </section>
  );
}
