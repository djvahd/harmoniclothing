import Link from "next/link";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import { useAuthModalStore } from "@/store/auth-modal-store";

/** The closing "Siap Mewujudkan Ide" call-to-action banner. */
export default function CtaSection() {
  const openAuthModal = useAuthModalStore((state) => state.open);

  return (
    <section className="px-4 py-16 md:px-20">
      <Reveal className="mx-auto flex w-full max-w-[1440px] flex-col items-start justify-between gap-6 rounded-lg bg-primary px-8 py-10 md:flex-row md:items-center">
        <div className="flex flex-col gap-2">
          <h2 className="font-heading text-h3 font-bold leading-snug text-text-on-accent">
            Siap Mewujudkan
            <br />
            Ide Menjadi Produk Nyata?
          </h2>
          <p className="font-body text-body-sm text-text-on-accent">
            Gabung bersama ribuan kreator dan brand yang percaya pada Harmoni.
          </p>
        </div>
        <div className="flex shrink-0 gap-3">
          <Link href="/catalog">
            <Button variant="primary" className="!bg-white !text-primary hover:!bg-white/90">
              Mulai Custom Design →
            </Button>
          </Link>
          <Button
            variant="secondary"
            className="!border-white !bg-transparent !text-text-on-accent hover:!bg-white/10"
            onClick={() => openAuthModal("register")}
          >
            Daftar Gratis →
          </Button>
        </div>
      </Reveal>
    </section>
  );
}
