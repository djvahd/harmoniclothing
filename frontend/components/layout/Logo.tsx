import Image from "next/image";
import Link from "next/link";

export default function Logo({ variant = "color" }: { variant?: "color" | "white" }) {
  return (
    <Link href="/" className="relative block h-7 w-[100px] shrink-0">
      <Image
        src={variant === "white" ? "/logo-white.png" : "/logo.png"}
        alt="Harmoni Clothing"
        fill
        sizes="100px"
        className="object-contain object-left"
        priority
      />
    </Link>
  );
}
