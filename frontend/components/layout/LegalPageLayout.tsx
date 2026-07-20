"use client";

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
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 md:flex-row md:px-8">
      <div className="flex-1">
        <h1 className="font-heading text-3xl font-semibold text-text-primary">{title}</h1>
        <p className="mt-2 font-body text-xs text-text-secondary">Terakhir diperbarui: {updatedAt}</p>

        <div className="mt-8 flex flex-col gap-8">
          {sections.map((section) => (
            <div key={section.id} id={section.id} className="scroll-mt-24">
              <h2 className="font-heading text-lg font-semibold text-text-primary">
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
            DAFTAR ISI
          </p>
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="font-body text-sm text-text-secondary hover:text-primary"
            >
              {section.title}
            </a>
          ))}
        </div>
      </aside>
    </div>
  );
}
