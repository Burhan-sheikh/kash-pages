import type { Metadata } from 'next';
import './globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://kashpages.in';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'KashPages',
    template: '%s | KashPages',
  },
  description:
    'Professional landing pages for local Kashmiri businesses. Get online presence on kashpages.in',
  keywords: [
    'Kashmir businesses',
    'local business directory',
    'landing pages',
    'Srinagar business',
    'business website',
  ],
  authors: [{ name: 'KashPages' }],
  creator: 'KashPages',
  publisher: 'KashPages',
  formatDetection: {
    email: false,
    telephone: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: SITE_URL,
    siteName: 'KashPages',
    title: 'KashPages - Local Business Landing Pages',
    description:
      'Professional landing pages for local Kashmiri businesses. Get indexed on Google, WhatsApp, Facebook.',
    images: [
      {
        url: '/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'KashPages',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KashPages - Local Business Landing Pages',
    description:
      'Professional landing pages for local Kashmiri businesses. Get indexed on Google, WhatsApp, Facebook.',
    creator: '@kashpages',
    images: ['/og-default.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to Firebase */}
        <link rel="preconnect" href="https://firestore.googleapis.com" />
        <link rel="preconnect" href="https://www.googleapis.com" />

        {/* Favicon and theme */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="color-scheme" content="light dark" />

        {/* Verification tags (optional) */}
        {process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION && (
          <meta
            name="google-site-verification"
            content={process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION}
          />
        )}

        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="https://cdn.tailwindcss.com" />

        {/* Manifest */}
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        {/* Minimal global layout - landing pages define their own structure */}
        {children}
      </body>
    </html>
  );
}
