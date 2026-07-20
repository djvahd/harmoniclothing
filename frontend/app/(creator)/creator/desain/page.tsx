"use client";

import Link from "next/link";
import Image from "next/image";
import useSWR from "swr";
import { Plus } from "lucide-react";
import CreatorSidebar from "@/components/layout/CreatorSidebar";
import SidebarPageShell from "@/components/layout/SidebarPageShell";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { getMyDesigns } from "@/services/creator";
import { storageUrl } from "@/lib/storage";
import type { DesignStatus } from "@/types/product";

const STATUS_VARIANT: Record<DesignStatus, "success" | "warning" | "danger" | "neutral"> = {
  draft: "neutral",
  menunggu_approval: "warning",
  published: "success",
  ditolak: "danger",
};

const STATUS_LABEL: Record<DesignStatus, string> = {
  draft: "Draft",
  menunggu_approval: "Menunggu Review",
  published: "Published",
  ditolak: "Ditolak",
};

export default function KelolaDesainPage() {
  const { data, isLoading } = useSWR("/creator/designs", getMyDesigns);
  const designs = data?.data ?? [];

  return (
    <SidebarPageShell sidebar={<CreatorSidebar />}>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-2xl font-semibold text-text-primary">Kelola Desain</h1>
          <Link href="/creator/desain/upload">
            <Button>
              <Plus className="size-4" /> Upload Desain
            </Button>
          </Link>
        </div>

        {isLoading && <p className="font-body text-sm text-text-secondary">Memuat desain...</p>}
        {!isLoading && designs.length === 0 && (
          <p className="font-body text-sm text-text-secondary">Belum ada desain diunggah.</p>
        )}

        <div className="flex flex-col gap-3">
          {designs.map((design) => {
            const thumbnail = storageUrl(design.thumbnail_path);
            return (
              <Link
                key={design.id}
                href={`/creator/desain/${design.id}`}
                className="flex items-center gap-4 rounded-md border border-border bg-surface p-4"
              >
                <div className="relative size-14 shrink-0 overflow-hidden rounded-sm bg-border">
                  {thumbnail && (
                    <Image src={thumbnail} alt={design.title} fill className="object-cover" />
                  )}
                </div>
                <p className="flex-1 font-body text-sm font-semibold text-text-primary">
                  {design.title}
                </p>
                <Badge variant={STATUS_VARIANT[design.status]}>
                  {STATUS_LABEL[design.status]}
                </Badge>
              </Link>
            );
          })}
        </div>
      </div>
    </SidebarPageShell>
  );
}
