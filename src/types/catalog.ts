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
  sort_order: number
  created_at: string
  updated_at: string
}

export type CategoryWithProducts = CategoryRow & {
  products: ProductRow[]
}
