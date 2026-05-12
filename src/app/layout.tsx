import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { getSiteContent } from "@/lib/get-content";
import { themeStyle } from "@/lib/theme-style";

const display = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  display: "swap",
});

const sans = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { studio } = await getSiteContent();
  return {
    title: {
      default: `${studio.name} — Architecture Presentation`,
      template: `%s · ${studio.name}`,
    },
    description: `${studio.name} — ${studio.tagline}.`,
    authors: [{ name: studio.name }],
    openGraph: {
      title: `${studio.name} — Architecture Presentation`,
      description: `${studio.tagline}. A cinematic concept presentation.`,
      type: "website",
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#f4f0e7",
  colorScheme: "light",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const content = await getSiteContent();
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable}`}
      style={themeStyle(content.theme)}
      suppressHydrationWarning
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
