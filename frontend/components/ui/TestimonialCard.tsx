import { Star } from "lucide-react";

interface TestimonialCardProps {
  quote: string;
  name: string;
  role: string;
  avatarSrc?: string;
  rating?: number;
}

export default function TestimonialCard({
  quote,
  name,
  role,
  avatarSrc,
  rating = 5,
}: TestimonialCardProps) {
  return (
    <div className="flex w-60 flex-col gap-2.5 rounded-md border border-border bg-surface p-4">
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={
              i < rating
                ? "size-3.5 fill-amber-400 text-amber-400"
                : "size-3.5 text-border"
            }
          />
        ))}
      </div>
      <p className="font-body text-body-sm text-text-primary">&ldquo;{quote}&rdquo;</p>
      <div className="flex items-center gap-2">
        <div
          className="size-8 shrink-0 rounded-full bg-border bg-cover bg-center"
          style={avatarSrc ? { backgroundImage: `url(${avatarSrc})` } : undefined}
        />
        <div className="flex flex-col">
          <p className="font-body text-body-sm font-semibold text-text-primary">{name}</p>
          <p className="font-body text-xs text-text-secondary">{role}</p>
        </div>
      </div>
    </div>
  );
}
