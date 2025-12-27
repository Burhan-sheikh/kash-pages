import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://kashpages.in';

/**
 * Generate robots.txt
 * Controls crawler behavior and references sitemap
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Allow all bots to crawl public pages
        userAgent: '*',
        allow: ['/'],
        disallow: [
          '/admin',      // Admin dashboard
          '/api',        // API routes
          '/_next',      // Next.js internal
        ],
        crawlDelay: 1,   // Respectful crawling
      },
      {
        // Specific rule for search engines (more aggressive)
        userAgent: ['Googlebot', 'Bingbot', 'Slurp'],
        allow: '/',
        crawlDelay: 0.5,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
