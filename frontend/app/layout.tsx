import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import AppProviders from "@/providers/AppProviders";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${montserrat.variable} ${inter.variable} font-body antialiased`}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
