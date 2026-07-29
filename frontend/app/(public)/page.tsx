"use client";

import HeroSection from "@/components/home/HeroSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import PopularProductsSection from "@/components/home/PopularProductsSection";
import PopularDesignsSection from "@/components/home/PopularDesignsSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import CtaSection from "@/components/home/CtaSection";

export default function BerandaPage() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <HowItWorksSection />
      <PopularProductsSection />
      <PopularDesignsSection />
      <TestimonialsSection />
      <CtaSection />
    </div>
  );
}
