import { ClipboardCheck, Palette, ShoppingBag, Truck } from "lucide-react";
import { useTranslations } from "next-intl";
import Reveal from "@/components/ui/Reveal";
import StepItem from "@/components/ui/StepItem";

const STEPS = [
  { icon: ShoppingBag, key: "chooseProduct" },
  { icon: Palette, key: "createDesign" },
  { icon: ClipboardCheck, key: "confirmOrder" },
  { icon: Truck, key: "receiveProduct" },
] as const;

/** The "Mudah dalam 4 Langkah" step-by-step explainer. */
export default function HowItWorksSection() {
  const t = useTranslations("home.howItWorks");
  return (
    <section className="px-4 py-16 md:px-20">
      <Reveal className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-2">
        <p className="font-body text-caption font-bold uppercase tracking-[0.6px] text-primary">
          {t("eyebrow")}
        </p>
        <h2 className="text-center font-heading text-h3 font-semibold text-text-primary md:text-h2">
          {t("title")}
        </h2>
        <div className="mt-6 flex w-full flex-wrap justify-center">
          <div className="relative inline-flex flex-wrap gap-10">
            {[0, 1, 2].map((segment) => (
              <div
                key={segment}
                className="absolute top-5 hidden h-0 w-[200px] animate-line-glow border-t-2 border-dashed border-primary opacity-0 md:block"
                style={{
                  left: `${80 + segment * 200}px`,
                  animationDelay: `${3 * segment + 1.5}s`,
                }}
              />
            ))}
            {STEPS.map((step, i) => (
              <StepItem
                key={step.key}
                number={i + 1}
                icon={step.icon}
                title={t(`steps.${step.key}.title`)}
                description={t(`steps.${step.key}.description`)}
              />
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
