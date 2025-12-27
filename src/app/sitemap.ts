import { MetadataRoute } from 'next';
import { getPublishedLandingPages } from '@/lib/firestore';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://kashpages.in';

/**
 * Generate sitemap for all published landing pages
 * Called at build time to pre-generate sitemap
 * Also available at runtime for dynamic updates
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    // Fetch all published landing pages
    const pages = await getPublishedLandingPages();

    // Map pages to sitemap entries
    const pageEntries: MetadataRoute.Sitemap = pages.map((page) => ({
      url: `${SITE_URL}/${page.slug}`,
      lastModified: page.updatedAt instanceof Date 
        ? page.updatedAt 
        : new Date(page.updatedAt as any),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }));

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
      {
        url: SITE_URL,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 1.0,
      },
      {
        url: `${SITE_URL}/about`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      },
      {
        url: `${SITE_URL}/privacy`,
        lastModified: new Date(),
        changeFrequency: 'yearly',
        priority: 0.5,
      },
      {
        url: `${SITE_URL}/terms`,
        lastModified: new Date(),
        changeFrequency: 'yearly',
        priority: 0.5,
      },
      {
        url: `${SITE_URL}/plans`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      },
    ];

    // Combine and return
    return [...staticPages, ...pageEntries];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return static pages only if there's an error
    return [
      {
        url: SITE_URL,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 1.0,
      },
    ];
  }
}
