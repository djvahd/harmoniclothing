import { useTranslations } from "next-intl";
import Badge, { type BadgeVariant } from "@/components/ui/Badge";
import type { DesignStatus } from "@/types/product";

const STATUS_VARIANT: Record<DesignStatus, BadgeVariant> = {
  draft: "neutral",
  menunggu_approval: "warning",
  aktif: "success",
  ditolak: "danger",
};

/** Design status pill shared by the creator dashboard, design list and design detail. */
export default function DesignStatusBadge({ status }: { status: DesignStatus }) {
  const t = useTranslations("common");
  return <Badge variant={STATUS_VARIANT[status] ?? "neutral"}>{t(`designStatus.${status}`)}</Badge>;
}
