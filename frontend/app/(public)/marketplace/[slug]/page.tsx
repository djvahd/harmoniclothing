import type { Metadata } from "next";
import { fetchPublic } from "@/lib/server-fetch";
import type { CreatorProfile } from "@/services/marketplace";
import CreatorProfileClient from "./CreatorProfileClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await fetchPublic<{ data: CreatorProfile }>(`/marketplace/creators/${slug}`);
  const creator = result?.data;

  if (!creator) {
    return { title: "Kreator Tidak Ditemukan" };
  }

  return {
    title: creator.name,
    description: creator.bio?.slice(0, 160) ?? `Profil kreator ${creator.name} di Harmoni Clothing.`,
  };
}

export default function CreatorProfilePage() {
  return <CreatorProfileClient />;
}
