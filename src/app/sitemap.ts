import { siteUrl } from '@/lib/seo'
import { createClient } from '@/lib/supabase/server'
import type { MetadataRoute } from 'next'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl()
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/catalogo`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/ofertas`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${base}/destacados`, changeFrequency: 'daily', priority: 0.8 },
  ]

  try {
    const supabase = await createClient()
    const { data } = await supabase.from('categories').select('slug, created_at').order('sort_order')
    const categoryRoutes: MetadataRoute.Sitemap = (data ?? []).map((cat) => ({
      url: `${base}/catalogo/${String(cat.slug)}`,
      lastModified: cat.created_at ? new Date(String(cat.created_at)) : undefined,
      changeFrequency: 'weekly',
      priority: 0.7,
    }))
    return [...staticRoutes, ...categoryRoutes]
  } catch {
    return staticRoutes
  }
}
