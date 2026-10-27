"use client";

import { useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { HEADER_SEARCH_EVENT, SEARCH_KEY } from "@/lib/filter-url";

const CATALOG_PATH = "/produk";

/** Product search that works from any page: on the catalog it updates the open list, elsewhere it opens the catalog with `?q=`. */
function SearchForm({ onDone, autoFocus }: { onDone?: () => void; autoFocus?: boolean }) {
  const t = useTranslations("layout.header");
  const router = useRouter();
  const pathname = usePathname();
  const [term, setTerm] = useState("");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const query = term.trim();
    if (pathname === CATALOG_PATH) {
      window.dispatchEvent(new CustomEvent(HEADER_SEARCH_EVENT, { detail: query }));
    } else {
      router.push(query ? `${CATALOG_PATH}?${SEARCH_KEY}=${encodeURIComponent(query)}` : CATALOG_PATH);
    }
    setTerm("");
    onDone?.();
  }

  return (
    <form
      role="search"
      onSubmit={submit}
      className="flex w-full items-center gap-2 rounded-sm border border-border bg-surface px-3 focus-within:border-primary"
    >
      <Search className="size-4 shrink-0 text-text-secondary" aria-hidden />
      <input
        type="search"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        autoFocus={autoFocus}
        aria-label={t("searchLabel")}
        placeholder={t("searchPlaceholder")}
        className="h-10 w-full bg-transparent font-body text-sm text-text-primary outline-none placeholder:text-text-secondary"
      />
    </form>
  );
}

/** Desktop header: an icon that opens a search field just below it. */
export function HeaderSearchButton() {
  const t = useTranslations("layout.header");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={wrapperRef}
      className="relative"
      onBlur={(e) => {
        if (!wrapperRef.current?.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") setOpen(false);
      }}
    >
      <button
        type="button"
        aria-label={t("searchLabel")}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex size-10 items-center justify-center text-text-primary transition-colors hover:text-primary"
      >
        <Search className="size-5" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-40 mt-2 w-72 rounded-md border border-border bg-surface p-3 shadow-lg">
          <SearchForm autoFocus onDone={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}

/** Mobile drawer: the field is always visible. */
export function MobileSearch({ onDone }: { onDone: () => void }) {
  return <SearchForm onDone={onDone} />;
}
