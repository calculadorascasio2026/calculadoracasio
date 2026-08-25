import { CasioStorefront } from '@/components/casio-storefront'
import { JsonLd } from '@/components/json-ld'
import { fetchFeaturedProducts } from '@/lib/fetch-featured'
import { fetchCategorySummaries } from '@/lib/fetch-products'
import { localBusinessJsonLd, pageMetadata, websiteJsonLd } from '@/lib/seo'
import { createClient } from '@/lib/supabase/server'
import { DEFAULT_HERO_PROMO, type HeroPromo, type ProductRow } from '@/types/catalog'
import type { Metadata } from 'next'

export const metadata: Metadata = pageMetadata({
  description:
    'Calculadoras Casio en Mendoza. ClassWiz, científicas y más. Eduardo Viñolo — calidad y precisión desde 1981.',
  path: '/',
})

export default async function HomePage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const whatsappE164 = process.env.NEXT_PUBLIC_WHATSAPP_E164
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL
  const tiktokUrl = process.env.NEXT_PUBLIC_TIKTOK_URL
  const instagramUrl = process.env.NEXT_PUBLIC_INSTAGRAM_URL
  const facebookUrl = process.env.NEXT_PUBLIC_FACEBOOK_URL

  let categories: Awaited<ReturnType<typeof fetchCategorySummaries>> = []
  let featuredProducts: ProductRow[] = []
  let heroPromo: HeroPromo = DEFAULT_HERO_PROMO

  try {
    const supabase = await createClient()
    const [cats, promoRes, featured] = await Promise.all([
      fetchCategorySummaries(supabase),
      supabase
        .from('hero_promo')
        .select('badge_text, title, subtitle, visible, show_featured_on_home, show_offers_on_home')
        .eq('id', 1)
        .maybeSingle(),
      fetchFeaturedProducts(supabase),
    ])
    categories = cats
    featuredProducts = featured
    if (promoRes.data) {
      heroPromo = {
        badge_text: promoRes.data.badge_text || DEFAULT_HERO_PROMO.badge_text,
        title: promoRes.data.title || DEFAULT_HERO_PROMO.title,
        subtitle: promoRes.data.subtitle || DEFAULT_HERO_PROMO.subtitle,
        visible: promoRes.data.show_offers_on_home ?? promoRes.data.visible ?? true,
        show_featured_on_home: promoRes.data.show_featured_on_home ?? true,
        show_offers_on_home: promoRes.data.show_offers_on_home ?? promoRes.data.visible ?? true,
      }
    }
  } catch {
    /* sin env o sin red */
  }

  return (
    <main>
      <JsonLd data={[websiteJsonLd(), localBusinessJsonLd()]} />
      <CasioStorefront
        categories={categories}
        featuredProducts={featuredProducts}
        supabaseUrl={supabaseUrl}
        whatsappE164={whatsappE164}
        contactEmail={contactEmail}
        tiktokUrl={tiktokUrl}
        instagramUrl={instagramUrl}
        facebookUrl={facebookUrl}
        heroPromo={heroPromo}
      />
    </main>
  )
}
