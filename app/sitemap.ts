import type { MetadataRoute } from 'next';

const SITE = 'https://www.theaiparty.uk';

export const revalidate = 86400;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    { url: `${SITE}`,              lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE}/policies`,     lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE}/our-team`,     lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE}/how-it-works`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE}/polls`,        lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE}/about`,        lastModified: now, changeFrequency: 'daily', priority: 0.8 },
  ];
}
