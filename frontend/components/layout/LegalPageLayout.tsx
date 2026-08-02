"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { useTranslations } from "next-intl";

export interface LegalSection {
  id: string;
  title: string;
  body: React.ReactNode;
}

export default function LegalPageLayout({
  title,
  updatedAt,
  sections,
}: {
  title: string;
  updatedAt: string;
  sections: LegalSection[];
}) {
  const t = useTranslations("public.legal.layout");
  const [activeId, setActiveId] = useState<string | null>(sections[0]?.id ?? null);

  useEffect(() => {
    const headings = sections
      .map((section) => document.getElementById(section.id))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-96px 0px -70% 0px", threshold: 0 },
    );

    headings.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-4 py-10 md:flex-row md:px-20">
      <div className="flex-1">
        <h1 className="font-heading text-h2 font-semibold text-text-primary">{title}</h1>
        <p className="mt-2 font-body text-xs text-text-secondary">
          {t("lastUpdated")} {updatedAt}
        </p>

        <div className="mt-8 flex flex-col gap-8">
          {sections.map((section) => (
            <div key={section.id} id={section.id} className="scroll-mt-24">
              <h2 className="font-heading text-h3 font-semibold text-text-primary">
                {section.title}
              </h2>
              <div className="mt-2 font-body text-sm text-text-secondary [&>p]:mb-3">
                {section.body}
              </div>
            </div>
          ))}
        </div>
      </div>

      <aside className="hidden w-[220px] shrink-0 md:block">
        <div className="sticky top-8 flex flex-col gap-2 rounded-md border border-border bg-surface p-4">
          <p className="font-body text-xs font-bold tracking-[0.6px] text-text-secondary">
            {t("tableOfContents")}
          </p>
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className={clsx(
                "font-body text-sm transition-colors hover:text-primary",
                section.id === activeId
                  ? "font-semibold text-primary"
                  : "text-text-secondary",
              )}
            >
              {section.title}
            </a>
          ))}
        </div>
      </aside>
    </div>
  );
}
