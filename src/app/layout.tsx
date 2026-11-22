import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { person } from "@/content";
import "./globals.css";

// One editorial serif for the big words, a plain sans for reading, a mono for
// the small labels on the model.
const display = Instrument_Serif({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

const sans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const mono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

// Share previews need absolute image URLs: SITE_URL when set, else the
// production domain Vercel provides, else the local server.
const siteUrl =
  process.env.SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3417");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: person.name,
  description: `${person.role}. I build infrastructure automation that plans, gets approved, and proves what it changed.`,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <head>
        <noscript>
          <style>{".world,.top-name,.top nav a{visibility:visible!important}"}</style>
        </noscript>
      </head>
      <body>{children}</body>
    </html>
  );
}
