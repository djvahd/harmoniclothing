import type { Metadata } from "next";
import { ChevronDown } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const tMeta = await getTranslations("public.info.meta.faq");
  return { title: tMeta("title"), description: tMeta("description") };
}

/** FAQ as native <details> accordions: keyboard/screen-reader friendly and works without JavaScript. */
export default async function FaqPage() {
  const t = await getTranslations("public.info");
  const tLayout = await getTranslations("public.legal.layout");
  const items = t.raw("faq.items") as { q: string; a: string }[];

  return (
    <div className="mx-auto flex w-full max-w-[860px] flex-col gap-6 px-4 py-10 md:px-20">
      <div>
        <h1 className="font-heading text-h2 font-semibold text-text-primary">{t("faq.title")}</h1>
        <p className="mt-2 font-body text-xs text-text-secondary">
          {tLayout("lastUpdated")} {t("updatedAt")}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {items.map((item, index) => (
          <details
            key={index}
            id={`faq-${index + 1}`}
            className="group rounded-md border border-border bg-surface open:shadow-sm"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-heading text-base font-semibold text-text-primary [&::-webkit-details-marker]:hidden">
              {item.q}
              <ChevronDown className="size-4 shrink-0 text-text-secondary transition-transform group-open:rotate-180" />
            </summary>
            <p className="px-5 pb-4 font-body text-sm text-text-secondary">{item.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
