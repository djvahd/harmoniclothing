"use client";

import { useParams } from "next/navigation";
import useSWR from "swr";
import DesignCard from "@/components/ui/DesignCard";
import { getCreatorBySlug } from "@/services/marketplace";

export default function ProfilPublikCreatorPage() {
  const params = useParams<{ slug: string }>();
  const { data, isLoading } = useSWR(`/marketplace/creators/${params.slug}`, () =>
    getCreatorBySlug(params.slug),
  );
  const creator = data?.data;

  if (isLoading) {
    return <p className="p-8 font-body text-sm text-text-secondary">Memuat profil kreator...</p>;
  }
  if (!creator) {
    return <p className="p-8 font-body text-sm text-text-secondary">Kreator tidak ditemukan.</p>;
  }

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-4 py-10 md:px-20">
      <div className="flex items-center gap-4">
        <span className="size-16 shrink-0 rounded-full bg-border" />
        <div className="flex flex-col">
          <h1 className="font-heading text-h3 font-semibold text-text-primary">
            {creator.name}
          </h1>
          {creator.since && (
            <p className="font-body text-sm text-text-secondary">
              Kreator sejak{" "}
              {new Date(creator.since).toLocaleDateString("id-ID", {
                month: "long",
                year: "numeric",
              })}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <p className="font-heading text-lg font-semibold text-text-primary">
          Desain oleh {creator.name}
        </p>
        <div className="flex flex-wrap justify-center gap-6 md:justify-start">
          {creator.designs.map((design) => (
            <DesignCard key={design.id} design={design} />
          ))}
          {creator.designs.length === 0 && (
            <p className="font-body text-sm text-text-secondary">Belum ada desain published.</p>
          )}
        </div>
      </div>
    </div>
  );
}
