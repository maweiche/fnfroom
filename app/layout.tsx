import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Footer } from "@/components/footer";
import { AuthProvider } from "@/lib/auth-context";
import { Navigation } from "@/components/navigation";
import { CTAMarquee } from "@/components/cta-marquee";
import { Suspense } from "react";
import { Scoreboard } from "@/components/scoreboard";
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const lemonMilk = localFont({
  src: [
    { path: "../assets/fonts/lemon_milk/LEMONMILK-Light.otf", weight: "300", style: "normal" },
    { path: "../assets/fonts/lemon_milk/LEMONMILK-LightItalic.otf", weight: "300", style: "italic" },
    { path: "../assets/fonts/lemon_milk/LEMONMILK-Regular.otf", weight: "400", style: "normal" },
    { path: "../assets/fonts/lemon_milk/LEMONMILK-RegularItalic.otf", weight: "400", style: "italic" },
    { path: "../assets/fonts/lemon_milk/LEMONMILK-Medium.otf", weight: "500", style: "normal" },
    { path: "../assets/fonts/lemon_milk/LEMONMILK-MediumItalic.otf", weight: "500", style: "italic" },
    { path: "../assets/fonts/lemon_milk/LEMONMILK-Bold.otf", weight: "700", style: "normal" },
    { path: "../assets/fonts/lemon_milk/LEMONMILK-BoldItalic.otf", weight: "700", style: "italic" },
  ],
  variable: "--font-lemon-milk",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://fridaynightfilmroom.com"),
  title: {
    default: "Friday Night Film Room | NC High School Sports",
    template: "%s | Friday Night Film Room",
  },
  description:
    "Regional sports news covering North Carolina high school basketball, football, and lacrosse. Game recaps, rankings, recruiting, and video highlights.",
  keywords: [
    "North Carolina high school sports",
    "NC basketball",
    "NC football",
    "NC lacrosse",
    "high school recruiting",
    "prep sports",
    "North Carolina recruiting",
    "high school basketball rankings",
    "high school football rankings",
    "NC prep sports news",
    "Friday Night Film Room",
    "FNFR",
  ],
  authors: [{ name: "Friday Night Film Room" }],
  creator: "Friday Night Film Room",
  publisher: "Friday Night Film Room",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/fnfr-logo.png",
  },
  openGraph: {
    title: "Friday Night Film Room | NC High School Sports",
    description:
      "Regional sports news covering North Carolina high school basketball, football, and lacrosse. Game recaps, rankings, recruiting, and video highlights.",
    url: "/",
    siteName: "Friday Night Film Room",
    images: [
      {
        url: "/og_image.png",
        width: 1200,
        height: 630,
        alt: "Friday Night Film Room - NC High School Sports News",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Friday Night Film Room | NC High School Sports",
    description:
      "Regional sports news covering North Carolina high school basketball, football, and lacrosse. Game recaps, rankings, recruiting, and video highlights.",
    images: ["/og_image.png"],
    creator: "@FNFilmRoom",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} ${lemonMilk.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Default to dark mode for cinematic experience
                  const theme = localStorage.getItem('theme') || 'dark';
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "NewsMediaOrganization",
              name: "Friday Night Film Room",
              alternateName: "FNFR",
              url: process.env.NEXT_PUBLIC_SITE_URL || "https://fridaynightfilmroom.com",
              logo: {
                "@type": "ImageObject",
                url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://fridaynightfilmroom.com"}/fnfr-logo.png`,
              },
              description:
                "Regional sports news covering North Carolina high school basketball, football, and lacrosse.",
              areaServed: {
                "@type": "State",
                name: "North Carolina",
              },
              sameAs: ["https://twitter.com/FNFilmRoom"],
              publishingPrinciples: `${process.env.NEXT_PUBLIC_SITE_URL || "https://fridaynightfilmroom.com"}/about`,
            }),
          }}
        />
      </head>
      <body className="font-sans antialiased bg-background">
        <AuthProvider>
        <Navigation />
        <Suspense
          fallback={
            <div className="w-full h-14 md:h-16 bg-background/80 backdrop-blur-md border-b border-border/50 animate-pulse" />
          }
        >
          <Scoreboard />
        </Suspense>
          <main className="min-h-screen">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
