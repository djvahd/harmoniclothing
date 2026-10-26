"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";

const TRUST_ITEMS = [
  { icon: "/hero/trust-icon-1.svg", key: "noMinOrder" },
  { icon: "/hero/trust-icon-2.svg", key: "premiumQuality" },
  { icon: "/hero/trust-icon-3.svg", key: "fastProduction" },
  { icon: "/hero/trust-icon-4.svg", key: "satisfactionGuarantee" },
] as const;

// depth: signed scroll factor — negative recedes upward (background), positive advances downward (foreground)
// scaleDelta: extra scale applied at max scroll (negative shrinks, positive grows)
// grouped so visually-paired layers move alike without drifting apart, but each layer gets slight
// jitter (phase/amp/freq) so paired layers don't look mechanically identical: podium trio (static),
// hoodie+kaos (garments), daun+benang (ground props — benang now drifts down-right toward daun),
// label+topi+card (bottom-right cluster)
const HERO_MOTION = [
  { depth: -0.08, hFactor: 0.05, ampY: 0, ampX: 0, freq: 0.15, phase: 0.5, scaleDelta: -0.1 },
  { depth: -0.1, hFactor: 0.05, ampY: 0, ampX: 0, freq: 0.15, phase: 0.5, scaleDelta: -0.12 },
  { depth: -0.12, hFactor: 0.05, ampY: 0, ampX: 0, freq: 0.15, phase: 0.5, scaleDelta: -0.14 },
  { depth: 0.08, hFactor: -0.02, ampY: 13, ampX: 5, freq: 0.2, phase: 1, scaleDelta: 0.05 },
  { depth: 0.085, hFactor: 0.03, ampY: 14.5, ampX: 5.5, freq: 0.21, phase: 1.6, scaleDelta: 0.055 },
  { depth: 0.08, hFactor: 0.09, ampY: 15, ampX: 6.5, freq: 0.3, phase: 3.4, scaleDelta: -0.05 },
  { depth: -0.09, hFactor: 0.08, ampY: 16, ampX: 6, freq: 0.28, phase: 4.2, scaleDelta: -0.1 },
  { depth: 0.075, hFactor: -0.09, ampY: 14, ampX: 5.5, freq: 0.23, phase: 1.7, scaleDelta: 0.025 },
  { depth: 0.085, hFactor: -0.11, ampY: 16, ampX: 6.5, freq: 0.25, phase: 2.4, scaleDelta: 0.035 },
  { depth: 0.08, hFactor: -0.1, ampY: 15, ampX: 6, freq: 0.24, phase: 2.1, scaleDelta: 0.03 },
];

const EASE_SETTLE = "cubic-bezier(0.22, 1, 0.36, 1)";
const EASE_POP = "cubic-bezier(0.34, 1.56, 0.64, 1)";

const HERO_ENTRANCE = [
  { x: 0, y: 14, scale: 0.94, rotate: 0, delay: 0, duration: 650, ease: EASE_SETTLE },
  { x: 0, y: 46, scale: 0.95, rotate: 0, delay: 70, duration: 700, ease: EASE_SETTLE },
  { x: 0, y: -22, scale: 0.9, rotate: 0, delay: 0, duration: 700, ease: EASE_SETTLE },
  { x: -170, y: 40, scale: 0.85, rotate: -16, delay: 260, duration: 780, ease: EASE_POP },
  { x: 180, y: -30, scale: 0.85, rotate: 18, delay: 360, duration: 800, ease: EASE_POP },
  { x: -70, y: 55, scale: 0.3, rotate: -20, delay: 460, duration: 700, ease: EASE_POP },
  { x: -55, y: 75, scale: 0.5, rotate: -28, delay: 520, duration: 720, ease: EASE_POP },
  { x: 95, y: -45, scale: 0.55, rotate: 20, delay: 560, duration: 720, ease: EASE_POP },
  { x: 60, y: 85, scale: 0.6, rotate: 22, delay: 600, duration: 720, ease: EASE_POP },
  { x: 45, y: 55, scale: 0.88, rotate: 0, delay: 680, duration: 650, ease: EASE_SETTLE },
];

function getHeroEntranceStyle(index: number, entered: boolean): CSSProperties {
  const cfg = HERO_ENTRANCE[index] ?? HERO_ENTRANCE[HERO_ENTRANCE.length - 1];
  return {
    opacity: entered ? 1 : 0,
    transform: entered
      ? "translate3d(0px, 0px, 0) scale(1) rotate(0deg)"
      : `translate3d(${cfg.x}px, ${cfg.y}px, 0) scale(${cfg.scale}) rotate(${cfg.rotate}deg)`,
    transitionProperty: "transform, opacity",
    transitionDuration: `${cfg.duration}ms`,
    transitionTimingFunction: cfg.ease,
    transitionDelay: `${cfg.delay}ms`,
    willChange: "transform, opacity",
  };
}

/** The landing hero: headline, CTAs, trust badges, and the parallax product collage. */
export default function HeroSection() {
  const t = useTranslations("home.hero");
  const heroCollageRef = useRef<HTMLDivElement>(null);
  const [heroEntered, setHeroEntered] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setHeroEntered(true);
      return;
    }
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setHeroEntered(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, []);

  useEffect(() => {
    const collage = heroCollageRef.current;
    if (!collage) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const layers = Array.from(collage.querySelectorAll<HTMLElement>("[data-hero-layer]"));
    if (layers.length === 0) return;

    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const t = (now - start) / 1000;
      const scrollY = Math.min(window.scrollY, 700);
      const scrollFactor = scrollY / 700;
      layers.forEach((el, i) => {
        const cfg = HERO_MOTION[i] ?? HERO_MOTION[HERO_MOTION.length - 1];
        const floatY = Math.sin(t * cfg.freq + cfg.phase) * cfg.ampY;
        const floatX = Math.cos(t * cfg.freq * 0.8 + cfg.phase) * cfg.ampX;
        const parallaxY = scrollY * cfg.depth;
        const parallaxX = scrollY * cfg.hFactor;
        const scale = 1 + cfg.scaleDelta * scrollFactor;
        el.style.transform = `translate3d(${floatX + parallaxX}px, ${floatY + parallaxY}px, 0) scale(${scale})`;
      });
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section
      className="relative overflow-hidden"
      style={{
        background:
          "linear-gradient(to bottom, transparent 85%, #f8fafc 100%), linear-gradient(28deg, #f8fafc 25%, #eef6f3 64%, #e0f1ea 96%)",
      }}
    >
      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 items-start gap-6 px-4 py-16 md:px-20 lg:grid-cols-[1fr_475px] xl:grid-cols-[1fr_623px] xl:pr-10 min-[1440px]:grid-cols-[1fr_648px] min-[1440px]:pr-10">
        <div className="flex flex-col items-start gap-7">
          <Reveal delay={0}>
            <h1 className="font-heading text-h3 font-semibold leading-tight text-text-primary md:text-h1 md:leading-[1.1]">
              {t("headline1")}
              <br />
              {t("headline2")}
              <br />
              {/* text-accent (mint on near-white) is only ~2:1, below even the 3:1 large-text minimum */}
              <span className="text-primary">{t("headline3")}</span>
            </h1>
          </Reveal>
          <Reveal delay={120}>
            <p className="max-w-md font-body text-base text-text-secondary">{t("subtitle")}</p>
          </Reveal>
          <Reveal delay={240}>
            <div className="flex flex-wrap gap-3">
              <Button href="/catalog" variant="primary">{t("ctaCustomDesign")}</Button>
              <Button href="/catalog" variant="secondary">{t("ctaExploreProducts")}</Button>
            </div>
          </Reveal>
          <Reveal delay={360}>
            <div className="flex flex-wrap gap-7">
              {TRUST_ITEMS.map((item) => (
                <div key={item.key} className="flex items-center gap-2.5">
                  <div className="relative size-8 shrink-0">
                    <Image src="/hero/trust-bg.svg" alt="" fill sizes="32px" priority />
                    <Image
                      src={item.icon}
                      alt=""
                      width={18}
                      height={18}
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                      priority
                    />
                  </div>
                  <div className="flex flex-col">
                    <p className="font-body text-sm font-semibold text-text-primary">
                      {t(`trust.${item.key}.title`)}
                    </p>
                    <p className="font-body text-body-sm text-text-secondary">
                      {t(`trust.${item.key}.subtitle`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="hidden overflow-hidden lg:block lg:h-[361px] lg:w-[475px] xl:h-[475px] xl:w-[623px] min-[1440px]:h-[494px] min-[1440px]:w-[648px]">
        <div
          ref={heroCollageRef}
          className="relative h-[526px] w-[690px] origin-top-left scale-[0.6875] xl:scale-[0.9029] min-[1440px]:scale-[0.9391]"
        >
          <div data-hero-layer className="absolute left-[50px] top-[408px] h-[118px] w-[578px]">
            <div className="relative h-full w-full" style={getHeroEntranceStyle(0, heroEntered)}>
              <Image src="/hero/podium-shadow.svg" alt="" fill sizes="578px" priority />
            </div>
          </div>
          <div data-hero-layer className="absolute left-0 top-[293px] h-[223px] w-[690px]">
            <div className="relative h-full w-full" style={getHeroEntranceStyle(1, heroEntered)}>
              <Image
                src="/hero/podium.png"
                alt=""
                fill
                sizes="690px"
                className="object-cover drop-shadow-md"
                priority
              />
            </div>
          </div>
          <div data-hero-layer className="absolute left-[156px] top-[15px] h-[365px] w-[306px]">
            <div className="relative h-full w-full" style={getHeroEntranceStyle(2, heroEntered)}>
              <Image src="/hero/background.png" alt="" fill sizes="306px" className="object-cover" priority />
            </div>
          </div>
          <div
            data-hero-layer
            className="absolute flex items-center justify-center"
            style={{ left: 38, top: 60, width: 302.5, height: 324.2 }}
          >
            <div className="flex h-full w-full items-center justify-center" style={getHeroEntranceStyle(3, heroEntered)}>
              <div className="relative h-[293px] w-[268px] rotate-[-7.2deg] drop-shadow-xl">
                <Image src="/hero/hoodie.png" alt={t("altHoodie")} fill sizes="268px" className="object-cover" priority />
              </div>
            </div>
          </div>
          <div
            data-hero-layer
            className="absolute flex items-center justify-center"
            style={{ left: 163.8, top: 0, width: 485.4, height: 449.3 }}
          >
            <div className="flex h-full w-full items-center justify-center" style={getHeroEntranceStyle(4, heroEntered)}>
              <div className="relative h-[374px] w-[420px] rotate-[11.37deg] drop-shadow-xl">
                <Image src="/hero/kaos.png" alt={t("altTshirt")} fill sizes="420px" className="object-cover" priority />
              </div>
            </div>
          </div>
          <div data-hero-layer className="absolute left-[16px] top-[110px] h-[57px] w-[58px]">
            <div className="relative h-full w-full" style={getHeroEntranceStyle(5, heroEntered)}>
              <Image src="/hero/benang.png" alt="" fill sizes="58px" className="object-cover drop-shadow-lg" priority />
            </div>
          </div>
          <div
            data-hero-layer
            className="absolute flex items-center justify-center"
            style={{ left: 7, top: 321, width: 61.2, height: 69.3 }}
          >
            <div className="flex h-full w-full items-center justify-center" style={getHeroEntranceStyle(6, heroEntered)}>
              <div className="relative h-[59px] w-[48px] rotate-[-14.66deg] drop-shadow-lg">
                <Image src="/hero/daun.png" alt="" fill sizes="48px" className="object-cover" priority />
              </div>
            </div>
          </div>
          <div
            data-hero-layer
            className="absolute flex items-center justify-center"
            style={{ left: 537.7, top: 251.6, width: 93.3, height: 73 }}
          >
            <div className="flex h-full w-full items-center justify-center" style={getHeroEntranceStyle(7, heroEntered)}>
              <div className="relative h-[70px] w-[91px] rotate-[1.95deg] drop-shadow-lg">
                <Image src="/hero/label.png" alt="" fill sizes="91px" className="object-cover" priority />
              </div>
            </div>
          </div>
          <div
            data-hero-layer
            className="absolute flex items-center justify-center"
            style={{ left: 449.6, top: 293.5, width: 148.5, height: 114.6 }}
          >
            <div className="flex h-full w-full items-center justify-center" style={getHeroEntranceStyle(8, heroEntered)}>
              <div className="relative h-[83px] w-[131px] rotate-15 drop-shadow-lg">
                <Image src="/hero/topi.png" alt="" fill sizes="131px" className="object-cover" priority />
              </div>
            </div>
          </div>

          <div data-hero-layer className="absolute left-[406px] top-[374px]">
            <div
              className="flex w-[180px] flex-col gap-1.5 rounded-md bg-white px-4 py-3 shadow-[0px_8px_24px_0px_rgba(0,0,0,0.18)]"
              style={getHeroEntranceStyle(9, heroEntered)}
            >
              <p className="font-body text-body-sm font-semibold text-text-primary">{t("cardTitle")}</p>
              <p className="font-body text-xs text-text-secondary">{t("cardSubtitle")}</p>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1.5">
                  {/* eslint-disable-next-line i18next/no-literal-string -- asset filenames, not display text */}
                  {["avatar1", "avatar2", "avatar3", "avatar4"].map((a) => (
                    <div key={a} className="relative size-[22px] rounded-full ring-1 ring-white">
                      <Image src={`/hero/${a}.png`} alt="" fill sizes="22px" className="rounded-full" priority />
                    </div>
                  ))}
                </div>
                {/* eslint-disable-next-line i18next/no-literal-string -- decorative placeholder stat, not real data */}
                <p className="font-body text-xs font-semibold text-text-secondary">12.3K</p>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}
