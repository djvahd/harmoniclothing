"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Award,
  Compass,
  Eye,
  Globe,
  Heart,
  Lightbulb,
  MapPin,
  Package,
  Palette,
  ShieldCheck,
  Sparkles,
  Star,
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

const REASONS = [
  { icon: Sparkles, key: "unlimitedCustom" },
  { icon: Award, key: "guaranteedQuality" },
  { icon: Palette, key: "localCreatorHub" },
  { icon: ShieldCheck, key: "secureTransaction" },
  { icon: Heart, key: "personalService" },
] as const;

const VALUES = [
  { icon: Award, key: "quality" },
  { icon: Lightbulb, key: "creativity" },
  { icon: Users, key: "community" },
  { icon: Eye, key: "transparency" },
] as const;

const STATS = [
  { icon: Package, key: "delivered" },
  { icon: Users, key: "activeCreators" },
  { icon: Palette, key: "designs" },
  { icon: Star, key: "rating" },
  { icon: MapPin, key: "provinces" },
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

const TESTIMONIALS = [
  { key: "bella", name: "Bella Anastasya", rating: 5 },
  { key: "fajar", name: "Fajar Nugroho", rating: 5 },
  { key: "dimas", name: "Dimas Alfarizi", rating: 5 },
  { key: "nadia", name: "Nadia Kirana", rating: 4 },
] as const;

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
        <Reveal className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-8 text-center lg:flex-row lg:items-center lg:justify-between lg:text-left">
          <div className="flex max-w-2xl flex-col items-center gap-4 lg:items-start">
            <h1 className="font-heading text-h3 font-semibold text-text-primary md:text-h1">
              {t("hero.title")}
            </h1>
            <p className="font-body text-base text-text-secondary">{t("hero.subtitle")}</p>
          </div>
          <div className="relative h-[180px] w-[210px] shrink-0 sm:h-[220px] sm:w-[255px] lg:h-[260px] lg:w-[300px]">
            <div className="absolute left-1/2 top-0 h-[152px] w-[137px] -translate-x-1/2 rotate-[-6deg] sm:h-[186px] sm:w-[167px] lg:h-[220px] lg:w-[196px]">
              <Image
                src="/hero/kaos.png"
                alt={t("hero.altTshirt")}
                fill
                sizes="196px"
                className="object-contain drop-shadow-xl"
                priority
              />
            </div>
            <div className="absolute bottom-2 left-0 h-[76px] w-[90px] rotate-[10deg] sm:h-[93px] sm:w-[110px] lg:h-[110px] lg:w-[130px]">
              <Image
                src="/hero/topi.png"
                alt={t("hero.altCap")}
                fill
                sizes="130px"
                className="object-contain drop-shadow-lg"
              />
            </div>
            <div className="absolute right-0 top-6 h-[42px] w-[36px] rotate-[-12deg] sm:h-[51px] sm:w-[44px] lg:h-[60px] lg:w-[52px]">
              <Image src="/hero/daun.png" alt="" fill sizes="52px" className="object-contain drop-shadow-lg" />
            </div>
          </div>
        </Reveal>
      </section>

      <section className="px-4 py-16 md:px-20">
        <Reveal className="mx-auto flex w-full max-w-[1440px] flex-col gap-10">
          <div className="flex flex-col items-center gap-2">
            <p className="font-body text-caption font-bold uppercase tracking-[0.6px] text-primary">
              {t("mission.eyebrow")}
            </p>
            <h2 className="text-center font-heading text-h3 font-semibold text-text-primary md:text-h2">
              {t("mission.title")}
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-6">
              <span className="flex size-10 items-center justify-center rounded-md bg-primary">
                <Compass className="size-5 text-text-on-accent" />
              </span>
              <h3 className="font-heading text-lg font-semibold text-text-primary">{t("mission.visionTitle")}</h3>
              <p className="font-body text-sm text-text-secondary">{t("mission.visionText")}</p>
            </div>
            <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-6">
              <span className="flex size-10 items-center justify-center rounded-md bg-accent">
                <Target className="size-5 text-text-on-accent" />
              </span>
              <h3 className="font-heading text-lg font-semibold text-text-primary">{t("mission.missionTitle")}</h3>
              <ul className="flex flex-col gap-2 font-body text-sm text-text-secondary">
                <li>{t("mission.missionItems.customApparel")}</li>
                <li>{t("mission.missionItems.creatorSpace")}</li>
                <li>{t("mission.missionItems.transparentProcess")}</li>
                <li>{t("mission.missionItems.community")}</li>
              </ul>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="bg-surface px-4 py-16 md:px-20">
        <Reveal className="mx-auto flex w-full max-w-[1440px] flex-col gap-8">
          <div className="flex flex-col items-center gap-2">
            <p className="font-body text-caption font-bold uppercase tracking-[0.6px] text-primary">
              {t("reasons.eyebrow")}
            </p>
            <h2 className="text-center font-heading text-h3 font-semibold text-text-primary md:text-h2">
              {t("reasons.title")}
            </h2>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {REASONS.map((r) => (
              <FeatureCard
                key={r.key}
                icon={r.icon}
                title={t(`reasons.items.${r.key}.title`)}
                description={t(`reasons.items.${r.key}.description`)}
              />
            ))}
          </div>
        </Reveal>
      </section>

      <section className="px-4 py-16 md:px-20">
        <Reveal className="mx-auto flex w-full max-w-[1440px] flex-col gap-10">
          <div className="flex flex-col items-center gap-2">
            <p className="font-body text-caption font-bold uppercase tracking-[0.6px] text-primary">
              {t("values.eyebrow")}
            </p>
            <h2 className="text-center font-heading text-h3 font-semibold text-text-primary md:text-h2">
              {t("values.title")}
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {VALUES.map((v) => (
              <div key={v.key} className="flex flex-col items-center gap-2 text-center">
                <span className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                  <v.icon className="size-5 text-primary" />
                </span>
                <p className="font-heading text-sm font-semibold text-text-primary">
                  {t(`values.items.${v.key}.title`)}
                </p>
                <p className="font-body text-xs text-text-secondary">
                  {t(`values.items.${v.key}.description`)}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="bg-surface px-4 py-16 md:px-20">
        <Reveal className="mx-auto flex w-full max-w-[1440px] flex-wrap justify-center gap-10">
          {STATS.map((stat) => (
            <div key={stat.key} className="flex flex-col items-center gap-1 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-accent/10">
                <stat.icon className="size-5 text-accent" />
              </span>
              <p className="font-heading text-2xl font-semibold text-text-primary">
                {t(`stats.items.${stat.key}.value`)}
              </p>
              <p className="font-body text-xs text-text-secondary">{t(`stats.items.${stat.key}.label`)}</p>
            </div>
          ))}
        </Reveal>
      </section>

      <section className="px-4 py-16 md:px-20">
        <Reveal className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-6 rounded-lg bg-accent/10 px-8 py-12 text-center md:flex-row md:items-center md:justify-between md:text-left">
          <div className="flex max-w-xl flex-col gap-3">
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
          <Link href="/account/become-creator" className="shrink-0">
            <Button variant="primary">{t("creatorCta.cta")}</Button>
          </Link>
        </Reveal>
      </section>

      <section className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-16 md:px-20">
        <Reveal className="flex flex-col gap-8">
          <h2 className="text-center font-heading text-h3 font-semibold text-text-primary md:text-h2">
            {t("timeline.title")}
          </h2>
          <div className="flex flex-col gap-6">
            {TIMELINE.map((item) => (
              <div key={item.year} className="flex gap-4">
                <p className="w-16 shrink-0 font-heading text-lg font-semibold text-primary">
                  {item.year}
                </p>
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
        </Reveal>
      </section>

      <section className="bg-surface px-4 py-16 md:px-20">
        <Reveal className="mx-auto flex w-full max-w-[1440px] flex-col gap-8">
          <h2 className="text-center font-heading text-h3 font-semibold text-text-primary md:text-h2">
            {t("process.title")}
          </h2>
          <div className="flex flex-wrap justify-center gap-10">
            <StepItem number={1} icon={Palette} title={t("process.steps.design.title")} description={t("process.steps.design.description")} />
            <StepItem number={2} icon={Award} title={t("process.steps.production.title")} description={t("process.steps.production.description")} />
            <StepItem number={3} icon={ShieldCheck} title={t("process.steps.qc.title")} description={t("process.steps.qc.description")} />
            <StepItem number={4} icon={Heart} title={t("process.steps.delivery.title")} description={t("process.steps.delivery.description")} />
          </div>
        </Reveal>
      </section>

      <section className="px-4 py-16 md:px-20">
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
