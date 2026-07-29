import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import { getLocale } from "next-intl/server";
import "./globals.css";
import AppProviders from "@/providers/AppProviders";
import I18nProvider from "@/providers/I18nProvider";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["500", "600"],
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Harmoni Clothing",
  description:
    "Platform print-on-demand, custom apparel, dan marketplace desain Indonesia.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale}>
      <body
        className={`${montserrat.variable} ${inter.variable} font-body antialiased`}
      >
        <I18nProvider>
          <AppProviders>{children}</AppProviders>
        </I18nProvider>
      </body>
    </html>
  );
}
