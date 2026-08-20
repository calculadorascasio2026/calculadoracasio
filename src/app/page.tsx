import { CasioStorefront } from '@/components/casio-storefront'
import { fetchCategoriesWithProducts } from '@/lib/fetch-products'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const whatsappE164 = process.env.NEXT_PUBLIC_WHATSAPP_E164
  const tiktokUrl = process.env.NEXT_PUBLIC_TIKTOK_URL
  const instagramUrl = process.env.NEXT_PUBLIC_INSTAGRAM_URL
  const facebookUrl = process.env.NEXT_PUBLIC_FACEBOOK_URL

  let categories: Awaited<ReturnType<typeof fetchCategoriesWithProducts>> = []
  try {
    const supabase = await createClient()
    categories = await fetchCategoriesWithProducts(supabase)
  } catch {
    /* sin env o sin red */
  }

  return (
    <main>
      <CasioStorefront
        categories={categories}
        supabaseUrl={supabaseUrl}
        whatsappE164={whatsappE164}
        tiktokUrl={tiktokUrl}
        instagramUrl={instagramUrl}
        facebookUrl={facebookUrl}
      />
    </main>
  )
}
