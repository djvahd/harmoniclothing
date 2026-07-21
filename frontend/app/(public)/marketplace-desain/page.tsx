"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import useSWR from "swr";
import DesignCard from "@/components/ui/DesignCard";
import { getDesigns } from "@/services/marketplace";

export default function MarketplaceDesainPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useSWR(["/marketplace/designs", search], () =>
    getDesigns({ search: search || undefined, per_page: 40 }),
  );
  const designs = data?.data ?? [];

  return (
    <div className="flex flex-col">
      <section className="flex flex-col gap-4 bg-surface px-4 py-10 md:px-20">
        <h1 className="font-heading text-h3 font-semibold text-text-primary md:text-h1">
          Marketplace Desain
        </h1>
        <p className="max-w-xl font-body text-sm text-text-secondary md:text-base">
          Jelajahi ratusan desain siap pakai dari kreator lokal Indonesia.
        </p>
        <div className="flex w-full max-w-[420px] items-center gap-2 rounded-sm border border-border bg-surface px-3 py-2.5">
          <Search className="size-4 shrink-0 text-text-secondary" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari desain..."
            className="w-full bg-transparent font-body text-sm text-text-primary outline-none placeholder:text-text-secondary"
          />
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-[1440px] flex-wrap justify-center gap-6 px-4 py-10 md:justify-start md:px-20">
        {isLoading && <p className="font-body text-sm text-text-secondary">Memuat desain...</p>}
        {!isLoading && designs.length === 0 && (
          <p className="font-body text-sm text-text-secondary">Belum ada desain ditemukan.</p>
        )}
        {designs.map((design) => (
          <DesignCard key={design.id} design={design} />
        ))}
      </section>
    </div>
  );
}
