import type { Metadata, Viewport } from "next";
import {
  Bricolage_Grotesque,
  DM_Serif_Display,
  IBM_Plex_Mono,
  Instrument_Serif,
  JetBrains_Mono,
  Manrope,
  Outfit,
  Plus_Jakarta_Sans,
  Sora,
} from "next/font/google";
import { brand } from "@/config/brand";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationSchema, websiteSchema } from "@/lib/seo";
import "./globals.css";

// Body font, used everywhere.
const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"], display: "swap" });

// Display fonts, one per page flavor (see globals.css). The browser only downloads the ones a page uses.
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});
const sora = Sora({ variable: "--font-sora", subsets: ["latin"], weight: ["500", "600", "700"], display: "swap" });
const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});
const outfit = Outfit({ variable: "--font-outfit", subsets: ["latin"], weight: ["500", "600", "700"], display: "swap" });
const plexMono = IBM_Plex_Mono({ variable: "--font-plex-mono", subsets: ["latin"], weight: ["500", "600"], display: "swap" });
const jetbrainsMono = JetBrains_Mono({ variable: "--font-jetbrains-mono", subsets: ["latin"], weight: ["500", "600", "700"], display: "swap" });
const bricolage = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"], weight: ["600", "700", "800"], display: "swap" });
const dmSerif = DM_Serif_Display({ variable: "--font-dm-serif", subsets: ["latin"], weight: "400", style: ["normal", "italic"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(brand.siteUrl),
  title: { default: brand.seo.defaultTitle, template: brand.seo.titleTemplate },
  description: brand.seo.defaultDescription,
  keywords: [...brand.seo.keywords],
  applicationName: brand.name,
  authors: [{ name: brand.name, url: brand.siteUrl }],
  creator: brand.name,
  publisher: brand.name,
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: { type: "website", siteName: brand.name, locale: brand.locale },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: brand.colors.ink,
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const fonts = [manrope, instrumentSerif, sora, plusJakarta, outfit, plexMono, jetbrainsMono, bricolage, dmSerif].map((f) => f.variable).join(" ");
  return (
    <html lang={brand.language} className={`${fonts} h-full`}>
      {/* Browser extensions (e.g. Grammarly) add attributes to <body> before React loads. */}
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        <a
          href="#main"
          className="sr-only-label focus:static focus:z-50 focus:block focus:bg-ink focus:p-3 focus:text-white"
        >
          Skip to content
        </a>
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
        {children}
      </body>
    </html>
  );
}
