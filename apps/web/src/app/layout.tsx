import type { Metadata } from "next";
import { Outfit, DM_Mono } from "next/font/google";
import { Nav } from "@/components/nav";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "P(l)otHole — Map it. Name it. Shame it. Fix it.",
  description:
    "Community-driven civic platform for reporting, tracking, and pressuring the repair of road hazards.",
  openGraph: {
    title: "P(l)otHole",
    description: "Map it. Name it. Shame it. Fix it.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${outfit.variable} ${dmMono.variable}`}>
      <body className="bg-[#171717] text-[#f5f5f5] antialiased font-sans">
        <Nav />
        <div className="pt-14">{children}</div>
      </body>
    </html>
  );
}
