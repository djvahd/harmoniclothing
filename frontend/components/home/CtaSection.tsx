import Link from "next/link";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import { useAuthModalStore } from "@/store/auth-modal-store";
import { useAuthStore } from "@/store/auth-store";

/** The closing "Siap Mewujudkan Ide" call-to-action banner. */
export default function CtaSection() {
  const t = useTranslations("home.cta");
  const { user } = useAuthStore();
  const openAuthModal = useAuthModalStore((state) => state.open);

  return (
    <section className="px-4 py-16 md:px-20">
      <Reveal className="mx-auto flex w-full max-w-[1440px] flex-col items-start justify-between gap-6 rounded-lg bg-primary px-8 py-10 md:flex-row md:items-center">
        <div className="flex flex-col gap-2">
          <h2 className="font-heading text-h3 font-bold leading-snug text-text-on-accent">
            {t("headline1")}
            <br />
            {t("headline2")}
          </h2>
          <p className="font-body text-body-sm text-text-on-accent">{t("subtitle")}</p>
        </div>
        <div className="flex shrink-0 gap-3">
          <Link href="/catalog">
            <Button variant="primary" className="!bg-white !text-primary hover:!bg-white/90">
              {t("ctaCustomDesign")}
            </Button>
          </Link>
          {!user && (
            <Button
              variant="secondary"
              className="!border-white !bg-transparent !text-text-on-accent hover:!bg-white/10"
              onClick={() => openAuthModal("register")}
            >
              {t("ctaRegister")}
            </Button>
          )}
        </div>
      </Reveal>
    </section>
  );
}
