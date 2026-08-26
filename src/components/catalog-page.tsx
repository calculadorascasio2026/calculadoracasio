'use client'

import { CartHeaderButton } from '@/components/cart-header-button'
import { CasioMark } from '@/components/casio-mark'
import { ProductCardInfo } from '@/components/product-card-info'
import { ProductDetailModal } from '@/components/product-detail-modal'
import { usePriceVisibility } from '@/context/price-visibility-context'
import { stripHtml } from '@/lib/description-html'
import { productImagePublicUrl } from '@/lib/image-url'
import type { CategoryRow, ProductRow } from '@/types/catalog'
import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'

export type CatalogCategory = CategoryRow & {
  products: ProductRow[]
}

type Props = {
  categories: CatalogCategory[]
  supabaseUrl: string
  activeCategorySlug?: string | null
  title: string
  subtitle: string
}

function ProductGrid({
  products,
  supabaseUrl,
  categoryById,
  onSelect,
}: {
  products: ProductRow[]
  supabaseUrl: string
  categoryById: (id: string) => string | null
  onSelect: (p: ProductRow) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => {
        const imgUrl = productImagePublicUrl(supabaseUrl, p.image_path)
        const catName = categoryById(p.category_id)
        return (
          <article
            key={p.id}
            className="overflow-hidden rounded-2xl border border-white/10 bg-casio-card transition hover:border-casio-lime/30"
          >
            <button
              type="button"
              onClick={() => onSelect(p)}
              className="relative flex aspect-[4/5] w-full items-end justify-center bg-white px-3 pt-4 text-left"
              aria-label={`Ver detalle de ${p.name}`}
            >
              {imgUrl ? (
                <Image
                  src={imgUrl}
                  alt={p.name}
                  width={140}
                  height={140}
                  className="max-h-[85%] w-auto object-contain"
                  unoptimized
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <CasioMark size="sm" className="!text-neutral-300 opacity-80" />
                </div>
              )}
              {p.stock < 1 ? (
                <span className="absolute left-2 top-2 rounded-md bg-black/80 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white/90 ring-1 ring-white/20">
                  Sin stock
                </span>
              ) : null}
            </button>
            <ProductCardInfo
              productId={p.id}
              name={p.name}
              description={p.description}
              unitPrice={p.price}
              imagePath={p.image_path}
              categoryName={catName}
              stock={p.stock}
              titleTag="h2"
            />
          </article>
        )
      })}
    </div>
  )
}

export function CatalogPage({
  categories,
  supabaseUrl,
  activeCategorySlug = null,
  title,
  subtitle,
}: Props) {
  const [detail, setDetail] = useState<ProductRow | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const { showPrices, toggleShowPrices } = usePriceVisibility()

  const categoryById = useMemo(() => {
    const map = new Map(categories.map((c) => [c.id, c.name]))
    return (id: string) => map.get(id) ?? null
  }, [categories])

  const activeCategory = useMemo(
    () => (activeCategorySlug ? categories.find((c) => c.slug === activeCategorySlug) ?? null : null),
    [activeCategorySlug, categories],
  )

  const visibleCategories = useMemo(() => {
    const q = searchQuery.trim().toLocaleLowerCase('es')
    const filterList = (list: ProductRow[]) => {
      if (!q) return list
      return list.filter((p) => {
        const name = p.name.toLocaleLowerCase('es')
        const desc = stripHtml(p.description ?? '').toLocaleLowerCase('es')
        const cat = (categoryById(p.category_id) ?? '').toLocaleLowerCase('es')
        return name.includes(q) || desc.includes(q) || cat.includes(q)
      })
    }

    if (activeCategory) {
      return [{ ...activeCategory, products: filterList(activeCategory.products) }]
    }
    return categories
      .map((c) => ({ ...c, products: filterList(c.products) }))
      .filter((c) => c.products.length > 0 || !q)
  }, [activeCategory, categories, searchQuery, categoryById])

  const totalProducts = visibleCategories.reduce((n, c) => n + c.products.length, 0)

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-casio-bg pb-10 text-casio-text sm:max-w-xl md:max-w-3xl lg:max-w-5xl">
      <header className="border-b border-white/10 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="text-xs text-casio-lime hover:underline">
            ← Volver a la tienda
          </Link>
          <div className="flex items-center gap-2">
            <CasioMark size="sm" className="opacity-80" />
            <CartHeaderButton />
          </div>
        </div>
        <h1 className="mt-4 font-casio text-3xl tracking-[0.12em] text-casio-lime sm:text-4xl">{title}</h1>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-casio-muted">{subtitle}</p>
          <button
            type="button"
            onClick={toggleShowPrices}
            className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition sm:text-xs ${
              showPrices
                ? 'border border-casio-lime/50 bg-casio-lime/15 text-casio-lime'
                : 'border border-white/15 text-casio-muted hover:border-casio-lime/40 hover:text-casio-lime'
            }`}
            aria-pressed={showPrices}
          >
            {showPrices ? 'Ocultar precios' : 'Mostrar precios'}
          </button>
        </div>
        <nav aria-label="Categorías del catálogo" className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/catalogo"
            className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition sm:text-xs ${
              !activeCategorySlug
                ? 'border border-casio-lime/50 bg-casio-lime/15 text-casio-lime'
                : 'border border-white/15 text-casio-muted hover:border-casio-lime/40 hover:text-casio-lime'
            }`}
            aria-current={!activeCategorySlug ? 'page' : undefined}
          >
            Todas
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/catalogo/${cat.slug}`}
              className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition sm:text-xs ${
                activeCategorySlug === cat.slug
                  ? 'border border-casio-lime/50 bg-casio-lime/15 text-casio-lime'
                  : 'border border-white/15 text-casio-muted hover:border-casio-lime/40 hover:text-casio-lime'
              }`}
              aria-current={activeCategorySlug === cat.slug ? 'page' : undefined}
            >
              {cat.name}
              <span className="ml-1 opacity-70">({cat.products.length})</span>
            </Link>
          ))}
        </nav>
      </header>

      <main className="px-4 pt-6 sm:px-6 lg:px-8">
        <div className="relative mb-5">
          <label htmlFor="catalog-page-search" className="sr-only">
            Buscar productos
          </label>
          <input
            id="catalog-page-search"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, categoría…"
            className="w-full rounded-xl border border-white/15 bg-casio-card px-4 py-2.5 pr-10 text-sm text-white placeholder:text-casio-muted outline-none transition focus:border-casio-lime/50"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-casio-muted hover:text-white"
              aria-label="Limpiar búsqueda"
            >
              ✕
            </button>
          ) : null}
        </div>

        <p className="mb-5 text-[10px] text-casio-muted sm:text-xs">{totalProducts} productos</p>

        {totalProducts === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 px-6 py-12 text-center">
            <CasioMark size="md" className="justify-center opacity-30" />
            <p className="mt-3 text-sm text-casio-muted">
              {searchQuery.trim()
                ? 'No hay productos que coincidan con la búsqueda.'
                : 'Todavía no hay productos en el catálogo.'}
            </p>
          </div>
        ) : activeCategory ? (
          <ProductGrid
            products={visibleCategories[0]?.products ?? []}
            supabaseUrl={supabaseUrl}
            categoryById={categoryById}
            onSelect={setDetail}
          />
        ) : (
          <div className="space-y-10">
            {visibleCategories.map((cat) =>
              cat.products.length === 0 ? null : (
                <section key={cat.id} aria-labelledby={`cat-${cat.slug}`}>
                  <div className="mb-4 flex items-end justify-between gap-3">
                    <h2
                      id={`cat-${cat.slug}`}
                      className="font-casio text-xl tracking-[0.12em] text-casio-lime md:text-2xl"
                    >
                      {cat.name.toUpperCase()}
                    </h2>
                    <Link
                      href={`/catalogo/${cat.slug}`}
                      className="shrink-0 text-[11px] font-semibold text-casio-lime hover:underline sm:text-xs"
                    >
                      Ver solo esta ›
                    </Link>
                  </div>
                  <ProductGrid
                    products={cat.products}
                    supabaseUrl={supabaseUrl}
                    categoryById={categoryById}
                    onSelect={setDetail}
                  />
                </section>
              ),
            )}
          </div>
        )}
      </main>

      {detail ? (
        <ProductDetailModal
          product={detail}
          supabaseUrl={supabaseUrl}
          categoryName={categoryById(detail.category_id)}
          onClose={() => setDetail(null)}
        />
      ) : null}
    </div>
  )
}
