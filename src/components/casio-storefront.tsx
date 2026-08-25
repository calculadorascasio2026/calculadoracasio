'use client'

import { CartHeaderButton } from '@/components/cart-header-button'
import { CasioMark } from '@/components/casio-mark'
import { FeaturedProductsCarousel } from '@/components/featured-products-carousel'
import { ProductCardInfo } from '@/components/product-card-info'
import { ProductDetailModal } from '@/components/product-detail-modal'
import { usePriceVisibility } from '@/context/price-visibility-context'
import type { CategorySummary } from '@/lib/fetch-products'
import { compareByName } from '@/lib/sort-catalog'
import { productImagePublicUrl } from '@/lib/image-url'
import type { HeroPromo, ProductRow } from '@/types/catalog'
import { DEFAULT_HERO_PROMO } from '@/types/catalog'
import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

type Props = {
  categories: CategorySummary[]
  featuredProducts?: ProductRow[]
  supabaseUrl: string
  whatsappE164?: string
  contactEmail?: string
  tiktokUrl?: string
  instagramUrl?: string
  facebookUrl?: string
  heroPromo?: HeroPromo
}

const BANNER_IMAGE = '/brand/banner4k.png'
const PAGE_SIZE = 8

function whatsappHref(e164: string) {
  const n = e164.replace(/\D/g, '')
  return n ? `https://wa.me/${n}` : '#'
}

function HeaderIcon({
  href,
  label,
  children,
  badge,
  className = '',
}: {
  href: string
  label: string
  children: React.ReactNode
  badge?: string
  className?: string
}) {
  return (
    <Link href={href} className={`casio-icon-btn relative ${className}`} aria-label={label}>
      {children}
      {badge ? (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-casio-lime px-1 text-[10px] font-bold text-black">
          {badge}
        </span>
      ) : null}
    </Link>
  )
}

function SocialIcon({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  const isMail = href.startsWith('mailto:')
  return (
    <a
      href={href}
      {...(isMail ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
      className="casio-icon-btn"
      aria-label={label}
    >
      {children}
    </a>
  )
}

function HeroBanner({ promo }: { promo: HeroPromo }) {
  return (
    <section className="hero-banner-shell relative mb-2 sm:mb-3">
      <div className="relative">
        <div className="relative overflow-hidden rounded-[1.65rem] bg-casio-card shadow-[0_18px_40px_rgba(0,0,0,0.45)] sm:rounded-[1.85rem] md:rounded-[2rem]">
          <div className="relative aspect-[16/10] min-h-[13.5rem] sm:aspect-[16/9] sm:min-h-[18rem] md:aspect-[21/9] md:min-h-[20rem]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={BANNER_IMAGE}
              alt="Calculadora Casio ClassWiz sobre cuaderno con fórmulas"
              className="hero-banner-image absolute inset-0 h-full w-full object-cover object-[78%_center] sm:object-[80%_center] md:object-right"
              decoding="async"
              fetchPriority="high"
            />

            <div className="hero-shade absolute inset-0 z-[1]" aria-hidden />

            <div className="absolute inset-0 z-10 flex flex-col justify-center px-4 pb-11 pt-4 sm:px-7 sm:pb-14 sm:pt-6 md:px-8 md:pb-16 lg:px-10">
              <p className="text-[9px] font-bold tracking-[0.22em] text-casio-lime sm:text-[11px]">
                CALIDAD Y PRECISIÓN
              </p>
              <h1 className="mt-1 font-serif text-[1.15rem] italic leading-none text-white sm:mt-2 sm:text-2xl md:text-[1.75rem]">
                Calculadoras
              </h1>
              <div className="mt-0.5">
                <CasioMark size="hero" />
              </div>
              <p className="mt-2 max-w-[11rem] text-[11px] leading-snug text-white/75 sm:mt-3 sm:max-w-[15rem] sm:text-[13px] md:max-w-[17rem] md:text-sm">
                Rendimiento que te acompaña en cada cálculo
              </p>
              <Link
                href="/catalogo"
                className="mt-3 inline-flex w-fit items-center gap-1 rounded-lg bg-casio-lime px-3.5 py-2 text-[11px] font-bold tracking-wide text-black hover:bg-casio-lime-bright sm:mt-5 sm:rounded-xl sm:px-5 sm:py-3 sm:text-sm"
              >
                VER CATÁLOGO
                <span aria-hidden className="text-base leading-none">
                  ›
                </span>
              </Link>
            </div>

            {promo.visible && promo.show_offers_on_home !== false ? (
              <div className="absolute bottom-2.5 left-2.5 z-20 sm:bottom-3 sm:left-3 md:bottom-4 md:left-4">
                <Link
                  href="/ofertas"
                  className="hero-offer-frame flex w-max max-w-[min(17rem,calc(100vw-2rem))] items-stretch overflow-hidden rounded-[0.85rem] border border-white/12 bg-black/82 transition hover:border-casio-lime/50 sm:max-w-none"
                  aria-label="Ver ofertas"
                >
                  <div className="flex shrink-0 items-center bg-casio-cream px-2.5 py-2 sm:px-3 sm:py-2.5">
                    <span className="text-[10px] font-extrabold leading-none text-black sm:text-xs">
                      {promo.badge_text}
                    </span>
                  </div>
                  <div className="flex items-center px-2.5 py-2 sm:px-3">
                    <div>
                      <p className="text-[8px] font-bold uppercase leading-tight tracking-wide text-white sm:text-[10px]">
                        {promo.title}
                      </p>
                      <p className="text-[7px] uppercase leading-tight tracking-wide text-white/65 sm:text-[9px]">
                        {promo.subtitle}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center pr-2.5 text-casio-lime sm:pr-3">
                    <svg viewBox="0 0 24 24" className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" aria-hidden>
                      <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58s1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41s-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z" />
                    </svg>
                  </div>
                </Link>
              </div>
            ) : null}
          </div>
        </div>

        {/* Mitad dentro del banner, mitad por fuera (borde inferior derecho) */}
        <div className="pointer-events-none absolute bottom-0 right-1 z-30 translate-y-1/2 sm:right-2 md:right-3">
          <Image
            src="/brand/sello-classwiz.png"
            alt="Casio ClassWiz"
            width={160}
            height={160}
            className="h-auto w-[4.75rem] drop-shadow-[0_8px_18px_rgba(0,0,0,0.55)] sm:w-[5.75rem] md:w-[6.75rem]"
            priority
          />
        </div>
      </div>
      {/* Espacio para la mitad del sello que sobresale */}
      <div className="h-10 sm:h-12 md:h-14" aria-hidden />
    </section>
  )
}

export function CasioStorefront({
  categories,
  featuredProducts = [],
  supabaseUrl,
  whatsappE164,
  contactEmail,
  tiktokUrl,
  instagramUrl = 'https://www.instagram.com/serviciotecnicovinolo/',
  facebookUrl = 'https://www.facebook.com/profile.php?id=61590593975773',
  heroPromo = DEFAULT_HERO_PROMO,
}: Props) {
  const [activeSlug, setActiveSlug] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [allProducts, setAllProducts] = useState<ProductRow[]>([])
  const [visibleLimit, setVisibleLimit] = useState(PAGE_SIZE)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [detail, setDetail] = useState<ProductRow | null>(null)
  const catalogRef = useRef<HTMLElement>(null)
  const { showPrices, toggleShowPrices } = usePriceVisibility()

  const categoryById = useCallback(
    (id: string) => categories.find((c) => c.id === id)?.name ?? null,
    [categories],
  )

  const activeCategory = useMemo(
    () => (activeSlug ? categories.find((c) => c.slug === activeSlug) ?? null : null),
    [activeSlug, categories],
  )

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    void fetch('/api/products?offset=0&limit=200')
      .then(async (res) => {
        const js = (await res.json()) as { error?: string; items?: ProductRow[] }
        if (!res.ok) throw new Error(js.error ?? 'Error al cargar')
        if (!cancelled) setAllProducts(js.items ?? [])
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLocaleLowerCase('es')
    return allProducts
      .filter((p) => {
        if (activeCategory && p.category_id !== activeCategory.id) return false
        if (!q) return true
        const name = p.name.toLocaleLowerCase('es')
        const desc = (p.description ?? '').toLocaleLowerCase('es')
        const cat = (categoryById(p.category_id) ?? '').toLocaleLowerCase('es')
        return name.includes(q) || desc.includes(q) || cat.includes(q)
      })
      .sort(compareByName)
  }, [allProducts, activeCategory, searchQuery, categoryById])

  const visibleProducts = useMemo(
    () => filteredProducts.slice(0, visibleLimit),
    [filteredProducts, visibleLimit],
  )

  const hasMore = visibleLimit < filteredProducts.length
  const year = new Date().getFullYear()

  function selectCategory(slug: string | null) {
    setActiveSlug(slug)
    setVisibleLimit(PAGE_SIZE)
    requestAnimationFrame(() => {
      catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  function onSearchChange(value: string) {
    setSearchQuery(value)
    setVisibleLimit(PAGE_SIZE)
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-casio-bg text-casio-text">
      <div className="mx-auto w-full max-w-md flex-1 pb-10 sm:max-w-xl md:max-w-3xl md:pb-12 lg:max-w-5xl">
      <header className="sticky top-0 z-40 bg-casio-bg/90 px-3 py-2 backdrop-blur-md sm:px-6 sm:py-3 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="header-logo relative shrink-0">
            <Image
              src="/brand/logo.jpeg"
              alt="Viñolo Casio"
              width={220}
              height={180}
              className="absolute left-1/2 top-[42%] h-[168%] w-[168%] max-w-none -translate-x-1/2 -translate-y-1/2 object-contain"
              priority
            />
          </Link>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {tiktokUrl ? (
              <SocialIcon href={tiktokUrl} label="TikTok">
                <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-current" aria-hidden>
                  <path d="M14.5 3c.4 2.4 1.8 4.1 4.2 4.5v2.3c-1.4 0-2.7-.5-3.8-1.3v6.6c0 3.4-2.7 6.1-6.1 6.1S2.7 18.5 2.7 15.1c0-3.3 2.6-6 5.9-6.1v2.4c-2 .1-3.5 1.7-3.5 3.7 0 2 1.7 3.7 3.7 3.7s3.7-1.7 3.7-3.7V3h2z" />
                </svg>
              </SocialIcon>
            ) : null}
            {contactEmail ? (
              <SocialIcon href={`mailto:${contactEmail}`} label="Email">
                <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-none stroke-current" strokeWidth="1.8" aria-hidden>
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M3.5 7.5 12 13l8.5-5.5" />
                </svg>
              </SocialIcon>
            ) : null}
            <SocialIcon href={instagramUrl} label="Instagram">
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-none stroke-current" strokeWidth="1.8" aria-hidden>
                <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
                <circle cx="12" cy="12" r="4.2" />
                <circle cx="17.4" cy="6.6" r="0.9" fill="currentColor" stroke="none" />
              </svg>
            </SocialIcon>
            <SocialIcon href={facebookUrl} label="Facebook">
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-current" aria-hidden>
                <path d="M14.2 21v-7.2h2.4l.4-2.8h-2.8V9.3c0-.8.2-1.4 1.4-1.4h1.5V5.4c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2h-2.5v2.8H11v7.2h3.2z" />
              </svg>
            </SocialIcon>
            {whatsappE164 ? (
              <a
                href={whatsappHref(whatsappE164)}
                target="_blank"
                rel="noopener noreferrer"
                className="casio-icon-btn text-casio-lime"
                aria-label="WhatsApp"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.882 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
            ) : null}
            <HeaderIcon href="/admin" label="Mi cuenta" className="hidden sm:flex">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2" aria-hidden>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </HeaderIcon>
            <CartHeaderButton />
          </div>
        </div>
      </header>

      <div className="px-3 pt-2 sm:px-6 sm:pt-3 lg:px-8">
        <HeroBanner promo={heroPromo} />
        <div className="mt-3 text-center sm:mt-4">
          <p className="font-casio text-[0.8rem] leading-snug tracking-[0.12em] text-casio-lime/85 sm:text-[0.95rem] sm:tracking-[0.14em]">
            marcando la diferencia desde 1981
          </p>
        </div>
      </div>

      {featuredProducts.length > 0 && heroPromo.show_featured_on_home !== false ? (
        <section className="mt-7 px-4 sm:px-6 lg:px-8">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="font-casio text-xl tracking-[0.12em] text-casio-lime md:text-2xl">DESTACADOS</h2>
            <Link href="/destacados" className="text-[11px] font-semibold text-casio-lime hover:underline sm:text-xs">
              VER TODO ›
            </Link>
          </div>
          <FeaturedProductsCarousel
            products={featuredProducts}
            supabaseUrl={supabaseUrl}
          />
        </section>
      ) : null}

      <section className="mt-7 px-4 sm:px-6 lg:px-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-casio text-xl tracking-[0.12em] text-casio-lime md:text-2xl">CATEGORÍAS</h2>
          <div className="flex items-center gap-3">
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
            <button
              type="button"
              onClick={() => selectCategory(null)}
              className="text-[11px] font-semibold text-casio-lime hover:underline sm:text-xs"
            >
              VER TODO ›
            </button>
          </div>
        </div>

        <div className="scrollbar-none -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 md:mx-0 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:px-0">
          {categories.map((cat) => {
            const count = cat.product_count
            const imgUrl = productImagePublicUrl(supabaseUrl, cat.thumb_path)
            const selected = activeSlug === cat.slug
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => selectCategory(selected ? null : cat.slug)}
                className={`w-[7.5rem] shrink-0 overflow-hidden rounded-2xl border text-left transition md:w-auto ${
                  selected ? 'border-casio-lime/70 bg-casio-card' : 'border-white/10 bg-casio-card hover:border-casio-lime/40'
                }`}
              >
                <div className="relative flex h-[5.5rem] items-end justify-center overflow-hidden bg-white px-2 pt-3 md:h-[7rem]">
                  {imgUrl ? (
                    <Image
                      src={imgUrl}
                      alt=""
                      width={90}
                      height={90}
                      className="h-[4.5rem] w-auto object-contain md:h-[5.5rem]"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center pb-2">
                      <CasioMark size="sm" className="!text-neutral-300 opacity-80" />
                    </div>
                  )}
                  <span className="absolute right-1.5 top-1.5 rounded-md bg-casio-cream px-1.5 py-0.5 text-[10px] font-extrabold text-black">
                    {count}
                  </span>
                </div>
                <div className="px-2.5 pb-3 pt-2 md:px-3 md:pb-4 md:pt-3">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-white md:text-xs">{cat.name.toUpperCase()}</p>
                  <p className="mt-1 text-[10px] font-medium text-casio-lime md:text-[11px]">Ver productos ›</p>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      <section
        id="catalogo"
        ref={catalogRef}
        className="mt-8 scroll-mt-24 px-4 sm:px-6 lg:px-8"
      >
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-casio text-xl tracking-[0.12em] text-casio-lime md:text-2xl">PRODUCTOS</h2>
            {activeCategory ? (
              <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-white/60">
                {activeCategory.name}
              </p>
            ) : null}
          </div>
          <span className="shrink-0 text-[10px] text-casio-muted sm:text-xs">
            {filteredProducts.length} en catálogo
          </span>
        </div>

        <div className="relative mb-5">
          <label htmlFor="catalog-search" className="sr-only">
            Buscar productos
          </label>
          <input
            id="catalog-search"
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por nombre, categoría…"
            className="w-full rounded-xl border border-white/15 bg-casio-card px-4 py-2.5 pr-10 text-sm text-white placeholder:text-casio-muted outline-none transition focus:border-casio-lime/50"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-casio-muted hover:text-white"
              aria-label="Limpiar búsqueda"
            >
              ✕
            </button>
          ) : null}
        </div>

        {loading ? (
          <p className="py-10 text-center text-sm text-casio-muted">Cargando productos…</p>
        ) : error ? (
          <p className="py-10 text-center text-sm text-red-300" role="alert">
            {error}
          </p>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 px-6 py-12 text-center">
            <CasioMark size="md" className="justify-center opacity-30" />
            <p className="mt-3 text-sm text-casio-muted">
              {searchQuery.trim()
                ? 'No hay productos que coincidan con la búsqueda.'
                : 'Todavía no hay productos cargados.'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
              {visibleProducts.map((p) => {
                const imgUrl = productImagePublicUrl(supabaseUrl, p.image_path)
                const catName = categoryById(p.category_id)
                return (
                  <article
                    key={p.id}
                    className="overflow-hidden rounded-2xl border border-white/10 bg-casio-card transition hover:border-casio-lime/30"
                  >
                    <button
                      type="button"
                      onClick={() => setDetail(p)}
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
                    />
                  </article>
                )
              })}
            </div>

            {hasMore ? (
              <div className="mt-6 flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => setVisibleLimit((n) => n + PAGE_SIZE)}
                  className="rounded-xl border border-casio-lime/50 bg-casio-lime/10 px-5 py-2.5 text-xs font-bold tracking-wide text-casio-lime transition hover:bg-casio-lime hover:text-black sm:text-sm"
                >
                  Ver más
                </button>
                <p className="text-[10px] text-casio-muted">
                  Mostrando {visibleProducts.length} de {filteredProducts.length}
                </p>
              </div>
            ) : null}
          </>
        )}
      </section>

      {detail ? (
        <ProductDetailModal
          product={detail}
          supabaseUrl={supabaseUrl}
          categoryName={categoryById(detail.category_id)}
          onClose={() => setDetail(null)}
        />
      ) : null}
      </div>

      <footer className="mt-auto w-full border-t border-white/10 bg-casio-surface/80">
        <div className="mx-auto w-full max-w-md px-4 py-8 sm:max-w-xl sm:px-6 md:max-w-3xl lg:max-w-5xl lg:px-8">
          <p className="font-casio text-lg tracking-[0.14em] text-casio-lime">EDUARDO VIÑOLO</p>
          <p className="mt-1 text-xs text-casio-muted">Calculadoras · Calidad y precisión desde 1981</p>

          <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-casio-muted">
            <Link href="/catalogo" className="hover:text-casio-lime">
              Catálogo
            </Link>
            <Link href="/ofertas" className="hover:text-casio-lime">
              Ofertas
            </Link>
            <Link href="/destacados" className="hover:text-casio-lime">
              Destacados
            </Link>
            {whatsappE164 ? (
              <a
                href={whatsappHref(whatsappE164)}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-casio-lime"
              >
                WhatsApp
              </a>
            ) : null}
            {contactEmail ? (
              <a href={`mailto:${contactEmail}`} className="hover:text-casio-lime">
                Contacto
              </a>
            ) : null}
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-casio-lime">
              Instagram
            </a>
            <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="hover:text-casio-lime">
              Facebook
            </a>
          </div>

          <div className="mt-6 space-y-1 border-t border-white/10 pt-5 text-[11px] leading-relaxed text-casio-muted">
            <p>© {year} Eduardo Viñolo. Todos los derechos reservados.</p>
            <p>Viñolo Casio — servicio técnico y venta de calculadoras Casio.</p>
            <p>Mendoza, Argentina.</p>
            <p className="pt-2">
              Desarrollo web:{' '}
              <a
                href="https://wa.me/5492612733660"
                target="_blank"
                rel="noopener noreferrer"
                className="text-casio-lime/90 hover:underline"
              >
                Andrés García · 261 273-3660
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
