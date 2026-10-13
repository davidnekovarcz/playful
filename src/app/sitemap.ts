import { MetadataRoute } from 'next'
import { PLAYFUL_SEO, SEOHelpers } from '@/lib/seo'

export default function sitemap(): MetadataRoute.Sitemap {
  const additionalUrls = [
    '/cookies',
    '/games/traffic-run',
    '/games/crossy-road',
    '/marooned',
    '/gta-praha',
  ];

  return SEOHelpers.generateSitemapUrls(PLAYFUL_SEO, additionalUrls);
}