import { MetadataRoute } from 'next'
import { getListedGames } from '@/data/games'
import { PLAYFUL_SEO, SEOHelpers } from '@/lib/seo'

export default function sitemap(): MetadataRoute.Sitemap {
  const gamePaths = getListedGames().map(game => `/${game.id}`);
  const additionalUrls = [
    '/cookies',
    ...gamePaths,
  ];

  return SEOHelpers.generateSitemapUrls(PLAYFUL_SEO, additionalUrls);
}