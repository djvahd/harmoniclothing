import { useTranslations } from "next-intl";
import TestimonialCard from "@/components/ui/TestimonialCard";
import Reveal from "@/components/ui/Reveal";

const TESTIMONIALS = [
  { key: "dimas", name: "Dimas Alfarizi", rating: 5 },
  { key: "sarah", name: "Sarah Amelia", rating: 5 },
  { key: "rizky", name: "Rizky Ramadhan", rating: 4 },
  { key: "nadia", name: "Nadia Kirana", rating: 5 },
  { key: "fajar", name: "Fajar Nugroho", rating: 5 },
  { key: "bella", name: "Bella Anastasya", rating: 4 },
  { key: "yoga", name: "Yoga Pratama", rating: 5 },
  { key: "putri", name: "Putri Wulandari", rating: 4 },
] as const;

/** The auto-scrolling social-proof marquee. */
export default function TestimonialsSection() {
  const t = useTranslations("home.testimonials");
  return (
    <section className="py-16">
      <Reveal className="flex w-full flex-col items-center gap-2">
        <p className="font-body text-caption font-bold uppercase tracking-[0.6px] text-primary">
          {t("eyebrow")}
        </p>
        <h2 className="text-center font-heading text-h3 font-semibold text-text-primary md:text-h2">
          {t("title")}
        </h2>
        <div className="mx-auto w-full max-w-[1440px] overflow-hidden px-4 [mask-image:linear-gradient(to_right,transparent_0%,black_5%,black_95%,transparent_100%)] md:px-20">
          <div className="flex w-max animate-marquee gap-6 hover:[animation-play-state:paused]">
            {[...TESTIMONIALS, ...TESTIMONIALS].map((item, i) => (
              <TestimonialCard
                key={`${item.name}-${i}`}
                quote={t(`items.${item.key}.quote`)}
                name={item.name}
                role={t(`items.${item.key}.role`)}
                rating={item.rating}
              />
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
