import Link from "next/link";
import { PackageSearch } from "lucide-react";

export default function DetailNotFound({
  message,
  backHref,
  backLabel,
}: {
  message: string;
  backHref: string;
  backLabel: string;
}) {
  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-3 px-4 py-24 text-center md:px-20">
      <PackageSearch className="size-10 text-text-secondary" />
      <p className="font-body text-sm text-text-secondary">{message}</p>
      <Link
        href={backHref}
        className="font-body text-sm font-medium text-primary underline underline-offset-4"
      >
        {backLabel}
      </Link>
    </div>
  );
}
