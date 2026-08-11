"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Award,
  Compass,
  Globe,
  Heart,
  Image as ImageIcon,
  Lightbulb,
  Palette,
  ShieldCheck,
  Sparkles,
  Target,
  UploadCloud,
  Users,
  Wallet,
} from "lucide-react";
import FeatureCard from "@/components/ui/FeatureCard";
import StepItem from "@/components/ui/StepItem";
import TestimonialCard from "@/components/ui/TestimonialCard";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import { useAuthModalStore } from "@/store/auth-modal-store";
import { useAuthStore } from "@/store/auth-store";

const PRINCIPLES = [
  { icon: Sparkles, key: "unlimitedCustom" },
  { icon: Award, key: "guaranteedQuality" },
  { icon: Lightbulb, key: "creativity" },
  { icon: Users, key: "localCreatorHub" },
  { icon: ShieldCheck, key: "secureTransparent" },
  { icon: Heart, key: "personalService" },
] as const;

const CREATOR_BENEFITS = [
  { icon: UploadCloud, key: "easyUpload" },
  { icon: Wallet, key: "transparentCommission" },
  { icon: Globe, key: "nationalReach" },
] as const;

const TIMELINE = [
  { year: "2023", key: "y2023" },
  { year: "2024", key: "y2024" },
  { year: "2026", key: "y2026" },
] as const;

const MISSION_ITEMS = ["customApparel", "creatorSpace", "transparentProcess", "community"] as const;

const TESTIMONIALS = [
  { key: "bella", name: "Bella Anastasya", rating: 5 },
  { key: "fajar", name: "Fajar Nugroho", rating: 5 },
  { key: "dimas", name: "Dimas Alfarizi", rating: 5 },
  { key: "nadia", name: "Nadia Kirana", rating: 4 },
] as const;

/** Decorative stand-in for a section photo until real photography is available; swap for next/image directly. */
function ImageSlot({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-gradient-to-br from-primary/10 via-accent/10 to-surface ${className}`}
    >
      <ImageIcon className="size-8 text-primary/25" aria-hidden />
    </div>
  );
}

export default function TentangKamiPage() {
  const t = useTranslations("public.about");
  const openAuthModal = useAuthModalStore((state) => state.open);
  const { user } = useAuthStore();
  return (
    <div className="flex flex-col">
      <section
        className="relative overflow-hidden px-4 py-16 md:px-20"
        style={{
          background:
            "linear-gradient(to bottom, transparent 85%, #f8fafc 100%), linear-gradient(28deg, #f8fafc 25%, #eef6f3 64%, #e0f1ea 96%)",
        }}
      >
        <Reveal className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-8 text-center">
          <div className="flex max-w-2xl flex-col items-center gap-4">
            <h1 className="font-heading text-h3 font-semibold text-text-primary md:text-h1">
              {t("hero.titlePrefix")} <span className="text-accent">Harmoni Clothing</span>
            </h1>
            <p className="font-body text-base text-text-secondary">{t("hero.subtitle")}</p>
          </div>
        </Reveal>
      </section>

      <section className="px-4 py-16 md:px-20">
        <Reveal className="mx-auto flex w-full max-w-[1440px] flex-col gap-10 lg:flex-row lg:items-center lg:gap-16">
          <ImageSlot className="aspect-[4/3] w-full lg:aspect-square lg:w-[380px]" />
          <div className="flex flex-1 flex-col gap-8">
            <div className="flex flex-col gap-2">
              <p className="font-body text-caption font-bold uppercase tracking-[0.6px] text-primary">
                {t("timeline.eyebrow")}
              </p>
              <h2 className="font-heading text-h3 font-semibold text-text-primary md:text-h2">
                {t("timeline.title")}
              </h2>
            </div>
            <div className="flex flex-col gap-6">
              {TIMELINE.map((item) => (
                <div key={item.year} className="flex gap-4">
                  <p className="w-16 shrink-0 font-heading text-lg font-semibold text-primary">{item.year}</p>
                  <div className="flex flex-col gap-1 border-l border-border pl-4">
                    <p className="font-body text-sm font-semibold text-text-primary">
                      {t(`timeline.items.${item.key}.title`)}
                    </p>
                    <p className="font-body text-sm text-text-secondary">
                      {t(`timeline.items.${item.key}.description`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <section className="bg-surface px-4 py-16 md:px-20">
        <Reveal className="mx-auto flex w-full max-w-[1440px] flex-col gap-10 lg:flex-row-reverse lg:items-center lg:gap-16">
          <ImageSlot className="aspect-[4/3] w-full lg:aspect-square lg:w-[380px]" />
          <div className="flex flex-1 flex-col gap-8">
            <div className="flex flex-col gap-2">
              <p className="font-body text-caption font-bold uppercase tracking-[0.6px] text-primary">
                {t("mission.eyebrow")}
              </p>
              <h2 className="font-heading text-h3 font-semibold text-text-primary md:text-h2">
                {t("mission.title")}
              </h2>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Compass className="size-4 text-primary" aria-hidden />
                <p className="font-body text-caption font-bold uppercase tracking-[0.6px] text-text-primary">
                  {t("mission.visionTitle")}
                </p>
              </div>
              <p className="font-body text-base text-text-secondary">{t("mission.visionText")}</p>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Target className="size-4 text-accent" aria-hidden />
                <p className="font-body text-caption font-bold uppercase tracking-[0.6px] text-text-primary">
                  {t("mission.missionTitle")}
                </p>
              </div>
              <ul className="flex flex-col gap-2">
                {MISSION_ITEMS.map((key) => (
                  <li key={key} className="font-body text-sm text-text-secondary">
                    {t(`mission.missionItems.${key}`)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="px-4 py-16 md:px-20">
        <Reveal className="mx-auto flex w-full max-w-[1440px] flex-col gap-10">
          <div className="flex flex-col items-center gap-2">
            <p className="font-body text-caption font-bold uppercase tracking-[0.6px] text-primary">
              {t("reasons.eyebrow")}
            </p>
            <h2 className="text-center font-heading text-h3 font-semibold text-text-primary md:text-h2">
              {t("reasons.title")}
            </h2>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {PRINCIPLES.map((p) => (
              <FeatureCard
                key={p.key}
                icon={p.icon}
                title={t(`reasons.items.${p.key}.title`)}
                description={t(`reasons.items.${p.key}.description`)}
              />
            ))}
          </div>
        </Reveal>
      </section>

      <section className="bg-surface px-4 py-16 md:px-20">
        <Reveal className="mx-auto flex w-full max-w-[1440px] flex-col gap-10">
          <h2 className="text-center font-heading text-h3 font-semibold text-text-primary md:text-h2">
            {t("process.title")}
          </h2>
          <ImageSlot className="h-48 w-full md:h-64" />
          <div className="flex flex-wrap justify-center gap-10">
            <StepItem number={1} icon={Palette} title={t("process.steps.design.title")} description={t("process.steps.design.description")} />
            <StepItem number={2} icon={Award} title={t("process.steps.production.title")} description={t("process.steps.production.description")} />
            <StepItem number={3} icon={ShieldCheck} title={t("process.steps.qc.title")} description={t("process.steps.qc.description")} />
            <StepItem number={4} icon={Heart} title={t("process.steps.delivery.title")} description={t("process.steps.delivery.description")} />
          </div>
        </Reveal>
      </section>

      <section className="px-4 py-16 md:px-20">
        <Reveal className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-8 rounded-lg bg-accent/10 px-8 py-12 md:flex-row md:items-center md:justify-between">
          <div className="flex max-w-xl flex-col gap-3 text-center md:text-left">
            <p className="font-body text-caption font-bold uppercase tracking-[0.6px] text-accent">
              {t("creatorCta.eyebrow")}
            </p>
            <h2 className="font-heading text-h3 font-semibold text-text-primary md:text-h2">
              {t("creatorCta.title")}
            </h2>
            <p className="font-body text-sm text-text-secondary">{t("creatorCta.description")}</p>
            <div className="flex flex-wrap justify-center gap-5 pt-1 md:justify-start">
              {CREATOR_BENEFITS.map((b) => (
                <div key={b.key} className="flex items-center gap-2">
                  <b.icon className="size-4 text-accent" />
                  <span className="font-body text-xs font-semibold text-text-primary">
                    {t(`creatorCta.benefits.${b.key}`)}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-center gap-4">
            <ImageSlot className="h-36 w-full max-w-[260px] md:w-[220px]" />
            <Link
              href="/account/become-creator"
              className="w-full max-w-[260px] md:w-[220px]"
              onClick={(e) => {
                if (!user) {
                  e.preventDefault();
                  openAuthModal("login");
                }
              }}
            >
              <Button variant="primary" fullWidth>
                {t("creatorCta.cta")}
              </Button>
            </Link>
          </div>
        </Reveal>
      </section>

      <section className="bg-surface px-4 py-16 md:px-20">
        <Reveal className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-8">
          <div className="flex flex-col items-center gap-2">
            <p className="font-body text-caption font-bold uppercase tracking-[0.6px] text-primary">
              {t("testimonials.eyebrow")}
            </p>
            <h2 className="text-center font-heading text-h3 font-semibold text-text-primary md:text-h2">
              {t("testimonials.title")}
            </h2>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {TESTIMONIALS.map((item) => (
              <TestimonialCard
                key={item.name}
                quote={t(`testimonials.items.${item.key}.quote`)}
                name={item.name}
                role={t(`testimonials.items.${item.key}.role`)}
                rating={item.rating}
              />
            ))}
          </div>
        </Reveal>
      </section>

      <section className="px-4 py-16 md:px-20">
        <Reveal className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-5 rounded-lg bg-primary px-8 py-14 text-center">
          <h2 className="font-heading text-h3 font-semibold text-text-on-accent md:text-h2">
            {t("finalCta.title")}
          </h2>
          {!user && (
            <Button variant="primary" onClick={() => openAuthModal("register")}>
              {t("finalCta.cta")}
            </Button>
          )}
        </Reveal>
      </section>
    </div>
  );
}
