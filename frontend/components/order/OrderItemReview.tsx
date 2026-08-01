"use client";

import { useState } from "react";
import clsx from "clsx";
import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import { getErrorMessage } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { submitReview } from "@/services/orders";
import { toast } from "@/store/toast-store";
import type { Review } from "@/types/product";

/** FE-039/BR-004: rating form for a completed order item, or the read-only rating if already reviewed. */
export default function OrderItemReview({
  orderId,
  orderItemId,
  review,
  onSubmitted,
}: {
  orderId: number;
  orderItemId: number;
  review: Review | null;
  onSubmitted: () => void;
}) {
  const t = useTranslations("customer.orderDetail.review");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (review) {
    return (
      <div className="flex flex-col gap-1.5 rounded-sm border border-border bg-background p-3">
        <div className="flex items-center justify-between">
          <p className="font-body text-xs font-medium text-text-secondary">{t("yourRating")}</p>
          <span className="font-body text-xs text-text-secondary">{formatDate(review.created_at)}</span>
        </div>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={clsx("size-4", i < review.rating ? "fill-warning text-warning" : "text-border")}
            />
          ))}
        </div>
        {review.comment && <p className="font-body text-sm text-text-primary">{review.comment}</p>}
      </div>
    );
  }

  async function handleSubmit() {
    if (rating < 1) {
      setError(t("selectRatingError"));
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await submitReview(orderId, { order_item_id: orderItemId, rating, comment: comment || undefined });
      toast(t("submitSuccess"), "success");
      onSubmitted();
    } catch (err) {
      setError(getErrorMessage(err, t("submitError")));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-sm border border-border bg-background p-3">
      <p className="font-body text-xs font-medium text-text-primary">{t("rateItem")}</p>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => {
          const starValue = i + 1;
          return (
            <button
              key={i}
              type="button"
              aria-label={t("starLabel", { n: starValue })}
              onMouseEnter={() => setHoverRating(starValue)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(starValue)}
            >
              <Star
                className={clsx(
                  "size-5",
                  starValue <= (hoverRating || rating) ? "fill-warning text-warning" : "text-border",
                )}
              />
            </button>
          );
        })}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
        className="w-full rounded-sm border border-border bg-surface px-3 py-2 font-body text-sm text-text-primary outline-none"
        placeholder={t("commentPlaceholder")}
      />
      {error && <p className="font-body text-xs text-danger">{error}</p>}
      <Button variant="secondary" loading={submitting} onClick={handleSubmit}>
        {t("submit")}
      </Button>
    </div>
  );
}
