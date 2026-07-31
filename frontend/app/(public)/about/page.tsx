import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import AboutClient from "./AboutClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("public.about.meta");
  return { title: t("title"), description: t("description") };
}

export default function AboutPage() {
  return <AboutClient />;
}
