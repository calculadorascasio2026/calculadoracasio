import { AdminMarketingPanel } from '@/components/admin-marketing-panel'
import { requireAdmin } from '@/lib/admin'
import { DEFAULT_HERO_PROMO, type HeroPromo, type ProductRow } from '@/types/catalog'

export default async function AdminMarketingPage() {
  const { supabase } = await requireAdmin()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const siteUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

  const [prodRes, offerRes, featRes, promoRes] = await Promise.all([
    supabase.from('products').select('*').order('sort_order').order('name'),
    supabase.from('product_offers').select('product_id, discount_percent, active'),
    supabase.from('featured_products').select('product_id, sort_order, active').order('sort_order'),
    supabase.from('hero_promo').select('badge_text, title, subtitle, visible, show_featured_on_home, show_offers_on_home').eq('id', 1).maybeSingle(),
  ])

  const products = (prodRes.data ?? []).map((row) => ({
    ...row,
    price: Number(row.price),
    stock: Number(row.stock ?? 0),
  })) as ProductRow[]

  const heroPromo: HeroPromo = promoRes.data
    ? {
        badge_text: promoRes.data.badge_text || DEFAULT_HERO_PROMO.badge_text,
        title: promoRes.data.title || DEFAULT_HERO_PROMO.title,
        subtitle: promoRes.data.subtitle || DEFAULT_HERO_PROMO.subtitle,
        visible: promoRes.data.show_offers_on_home ?? promoRes.data.visible ?? true,
        show_featured_on_home: promoRes.data.show_featured_on_home ?? true,
        show_offers_on_home: promoRes.data.show_offers_on_home ?? promoRes.data.visible ?? true,
      }
    : DEFAULT_HERO_PROMO

  return (
    <AdminMarketingPanel
      products={products}
      initialOffers={(offerRes.data ?? []).map((o) => ({
        product_id: o.product_id,
        discount_percent: Number(o.discount_percent),
        active: Boolean(o.active),
      }))}
      initialFeatured={(featRes.data ?? []).map((f) => ({
        product_id: f.product_id,
        sort_order: Number(f.sort_order),
        active: Boolean(f.active),
      }))}
      initialHeroPromo={heroPromo}
      supabaseUrl={supabaseUrl}
      siteUrl={siteUrl}
    />
  )
}
