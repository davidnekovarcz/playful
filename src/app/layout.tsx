import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ParticleBackground from '@/components/ParticleBackground';
import Script from "next/script";
import { PLAYFUL_SEO, SEOHelpers } from '@/lib/seo';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: PLAYFUL_SEO.title,
  description: PLAYFUL_SEO.description,
  keywords: PLAYFUL_SEO.keywords,
  authors: [{ name: PLAYFUL_SEO.author, url: "https://github.com/smarlify" }],
  creator: PLAYFUL_SEO.creator,
  publisher: PLAYFUL_SEO.publisher,
  metadataBase: new URL(PLAYFUL_SEO.url),
  alternates: {
    canonical: PLAYFUL_SEO.canonical,
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
  openGraph: {
    type: "website",
    locale: "en_US",
    url: PLAYFUL_SEO.url,
    siteName: PLAYFUL_SEO.siteName,
    title: PLAYFUL_SEO.title,
    description: PLAYFUL_SEO.description,
    images: [
      {
        url: PLAYFUL_SEO.ogImage,
        width: 1200,
        height: 630,
        alt: "GTA Praha welcome view over Petřín in Prague",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: PLAYFUL_SEO.twitter.site,
    creator: PLAYFUL_SEO.twitter.creator,
    title: PLAYFUL_SEO.title,
    description: PLAYFUL_SEO.description,
    images: [PLAYFUL_SEO.twitterImage],
  },
  verification: {
    google: PLAYFUL_SEO.googleVerification,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = SEOHelpers.generateStructuredData(PLAYFUL_SEO);

  return (
    <html lang="en">
      <head>
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
        {/* Umami Analytics */}
        <Script
          src="https://cloud.umami.is/script.js"
          data-website-id="83e255ad-387c-4a7d-90af-8b5787fc38bb"
          strategy="afterInteractive"
        />
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-C4NNL9P9S8"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-C4NNL9P9S8');
            
            // Global GA event tracking function
            window.trackEvent = function(eventName, parameters = {}) {
              if (typeof gtag !== 'undefined') {
                gtag('event', eventName, parameters);
                console.log('GA Event tracked:', eventName, parameters);
              } else {
                console.warn('gtag not available for event:', eventName);
              }
            };
            
            // Test GA on page load
            gtag('event', 'page_view', {
              page_title: document.title,
              page_location: window.location.href
            });
          `}
        </Script>
      </head>
      <body
        className={`${inter.variable} font-sans antialiased gaming-bg`}
      >
        <ParticleBackground />
        {children}
      </body>
    </html>
  );
}
