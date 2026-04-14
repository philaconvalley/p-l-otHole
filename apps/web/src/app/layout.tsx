import type { Metadata, Viewport } from "next";
import { Outfit, DM_Mono } from "next/font/google";
import { Nav } from "@/components/nav";
import { Providers } from "@/components/providers";
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
  icons: {
    icon: "/plothole-favicon.png",
    apple: "/plothole-favicon.png",
  },
  openGraph: {
    title: "P(l)otHole",
    description: "Map it. Name it. Shame it. Fix it.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${outfit.variable} ${dmMono.variable}`}>
      <body className="bg-[#171717] text-[#f5f5f5] antialiased font-sans">
        <Providers>
          <Nav />
          <div className="pt-14">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
