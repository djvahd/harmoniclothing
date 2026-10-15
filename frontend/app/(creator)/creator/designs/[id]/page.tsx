"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import useSWR, { mutate } from "swr";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import LoadingState from "@/components/ui/LoadingState";
import { getMyDesigns, confirmApparel, submitDesign } from "@/services/creator";
import { storageUrl } from "@/lib/storage";
import { getErrorMessage } from "@/lib/api";

export default function EditorPreviewMultiApparelPage() {
  const t = useTranslations("creator.designPreview");
  const tCommon = useTranslations("common");
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
        getErrorMessage(err, tCommon("errorGeneric")),
      );
    } finally {
      setLoading(false);
    }
  }

  if (isLoading) return <LoadingState variant="detail" />;
  if (!design) return <p className="p-8 font-body text-sm text-text-secondary">{t("notFound")}</p>;

  const thumbnail = storageUrl(design.thumbnail_path);
  // Submitting needs every chosen apparel preview confirmed (the API answers 422 otherwise).
  const allConfirmed = (design.apparel ?? []).length > 0 && (design.apparel ?? []).every((a) => !!a.confirmed_at);

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-4 py-8 md:px-20">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-h3 font-semibold text-text-primary">{design.title}</h1>
        <Badge variant="neutral">{tCommon(`designStatus.${design.status}`)}</Badge>
      </div>

      {design.status === "ditolak" && design.rejection_reason && (
        <div className="rounded-md border border-danger/20 bg-danger/5 p-4">
          <p className="font-body text-sm font-semibold text-danger">{t("rejectedTitle")}</p>
          <p className="font-body text-sm text-danger">{design.rejection_reason}</p>
        </div>
      )}

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
              {apparel.name ?? `${t("productLabel")}#${apparel.product_id}`}
            </p>
            {apparel.confirmed_at ? (
              <div className="flex items-center gap-1.5 font-body text-xs text-accent">
                <CheckCircle2 className="size-4" /> {t("confirmed")}
              </div>
            ) : (
              <Button
                variant="secondary"
                loading={loading}
                onClick={() => handleConfirm(apparel.product_id)}
              >
                {t("confirmPreview")}
              </Button>
            )}
          </div>
        ))}
      </div>

      {error && <p className="font-body text-xs text-danger">{error}</p>}
      {design.status === "draft" && (
        <Button
          loading={loading}
          disabled={!allConfirmed}
          onClick={handleSubmit}
          className="self-start"
        >
          {t("submitForApproval")}
        </Button>
      )}
    </div>
  );
}
