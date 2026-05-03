import type { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

const SITE = 'https://www.theaiparty.uk';

export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${SITE}`,              lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE}/policies`,     lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE}/departments`,  lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE}/our-team`,     lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE}/how-it-works`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE}/polls`,        lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE}/about`,        lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE}/donate`,       lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
  ];

  const [{ data: depts }, { data: policies }] = await Promise.all([
    supabase.from('ap_departments').select('slug').order('display_order', { ascending: true }),
    supabase.from('ap_policies').select('id').order('id', { ascending: true }),
  ]);

  const deptEntries: MetadataRoute.Sitemap = (depts ?? []).map(d => ({
    url: `${SITE}/departments/${d.slug}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  const policyEntries: MetadataRoute.Sitemap = (policies ?? []).map(p => ({
    url: `${SITE}/policies/${p.id}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  return [...staticEntries, ...deptEntries, ...policyEntries];
}
