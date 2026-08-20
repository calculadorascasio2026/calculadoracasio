export type CategoryRow = {
  id: string
  name: string
  slug: string
  sort_order: number
}

export type ProductRow = {
  id: string
  category_id: string
  name: string
  description: string | null
  price: number
  image_path: string | null
  active: boolean
  stock: number
  sort_order: number
  created_at: string
  updated_at: string
}

export type CategoryWithProducts = CategoryRow & {
  products: ProductRow[]
}

export type HeroPromo = {
  badge_text: string
  title: string
  subtitle: string
  visible: boolean
  show_featured_on_home: boolean
  show_offers_on_home: boolean
}

export const DEFAULT_HERO_PROMO: HeroPromo = {
  badge_text: '10% OFF',
  title: 'Oferta en compras',
  subtitle: 'en productos seleccionados',
  visible: true,
  show_featured_on_home: true,
  show_offers_on_home: true,
}
