import clsx from "clsx";

/** Bare pulsing placeholder block; size/shape entirely via `className`. Building block for LoadingState. */
export default function Skeleton({ className }: { className?: string }) {
  return <div className={clsx("animate-pulse rounded-sm bg-border", className)} />;
}
