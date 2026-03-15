import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
