import clsx from "clsx";

interface OrderStatusItemProps {
  title: string;
  timestamp: string;
  done?: boolean;
  isLast?: boolean;
}

/** One step in an order status timeline; connects to the next step unless `isLast`. */
export default function OrderStatusItem({
  title,
  timestamp,
  done = true,
  isLast = false,
}: OrderStatusItemProps) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <span
          className={clsx(
            "size-3.5 rounded-full",
            done ? "bg-accent" : "bg-border",
          )}
        />
        {!isLast && <span className="mt-1 w-px flex-1 bg-border" />}
      </div>
      <div className="flex flex-col gap-0.5 pb-6">
        <p className="font-body text-sm font-semibold text-text-primary">{title}</p>
        <p className="font-body text-xs text-text-secondary">{timestamp}</p>
      </div>
    </div>
  );
}
