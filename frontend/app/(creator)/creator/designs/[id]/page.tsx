"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import useSWR, { mutate } from "swr";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { getMyDesigns, confirmApparel, submitDesign } from "@/services/creator";
import { storageUrl } from "@/lib/storage";
import { getErrorMessage } from "@/lib/api";

export default function EditorPreviewMultiApparelPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const designId = Number(params.id);
  const { data, isLoading } = useSWR("/creator/designs", getMyDesigns);
  const design = data?.data.find((d) => d.id === designId);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleConfirm(productId: number) {
    setLoading(true);
    try {
      await confirmApparel(designId, productId);
      mutate("/creator/designs");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    try {
      await submitDesign(designId);
      router.push("/creator/designs");
    } catch (err) {
      setError(
        getErrorMessage(err, "Terjadi kesalahan, coba lagi."),
      );
    } finally {
      setLoading(false);
    }
  }

  if (isLoading) return <p className="p-8 font-body text-sm text-text-secondary">Memuat desain...</p>;
  if (!design) return <p className="p-8 font-body text-sm text-text-secondary">Desain tidak ditemukan.</p>;

  const thumbnail = storageUrl(design.thumbnail_path);

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-4 py-8 md:px-20">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-h3 font-semibold text-text-primary">{design.title}</h1>
        <Badge variant="neutral">{design.status}</Badge>
      </div>

      <div className="flex flex-wrap justify-center gap-6">
        {(design.apparel ?? []).map((apparel) => (
          <div
            key={apparel.product_id}
            className="flex w-[220px] flex-col gap-3 rounded-md border border-border bg-surface p-4"
          >
            <div className="relative h-[220px] w-full overflow-hidden rounded-sm bg-border">
              {thumbnail && (
                <Image src={thumbnail} alt={design.title} fill className="object-contain p-6" />
              )}
            </div>
            <p className="font-body text-sm font-semibold text-text-primary">
              Produk #{apparel.product_id}
            </p>
            {apparel.confirmed_at ? (
              <div className="flex items-center gap-1.5 font-body text-xs text-accent">
                <CheckCircle2 className="size-4" /> Terkonfirmasi
              </div>
            ) : (
              <Button
                variant="secondary"
                loading={loading}
                onClick={() => handleConfirm(apparel.product_id)}
              >
                Konfirmasi Preview
              </Button>
            )}
          </div>
        ))}
      </div>

      {error && <p className="font-body text-xs text-red-500">{error}</p>}
      {design.status === "draft" && (
        <Button loading={loading} onClick={handleSubmit} className="self-start">
          Submit untuk Approval
        </Button>
      )}
    </div>
  );
}
