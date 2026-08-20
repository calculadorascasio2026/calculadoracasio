'use client'

import { CasioMark } from '@/components/casio-mark'
import { formatMoneyArs } from '@/lib/format'
import { productImagePublicUrl } from '@/lib/image-url'
import type { CategoryWithProducts } from '@/types/catalog'
import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'

type Props = {
  categories: CategoryWithProducts[]
  supabaseUrl: string
  whatsappE164?: string
  tiktokUrl?: string
  instagramUrl?: string
  facebookUrl?: string
}

const BANNER_IMAGE = '/brand/banner4k.png'

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

function NavIcon({ active, label, children }: { active?: boolean; label: string; children: React.ReactNode }) {
  return (
    <span
      className={`flex flex-col items-center gap-1 px-2 py-1 text-[10px] font-medium sm:text-[11px] ${
        active ? 'text-casio-lime' : 'text-casio-muted'
      }`}
    >
      <span className={`h-6 w-6 ${active ? 'text-casio-lime' : 'text-white/70'}`}>{children}</span>
      {label}
    </span>
  )
}

function SocialIcon({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="casio-icon-btn"
      aria-label={label}
    >
      {children}
    </a>
  )
}

function HeroBanner() {
  return (
    <section className="hero-banner-shell relative overflow-hidden rounded-[1.65rem] border border-white/10 bg-casio-card sm:rounded-[1.85rem] md:rounded-[2rem]">
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
          <p className="mt-1 font-serif text-[1.15rem] italic leading-none text-white sm:mt-2 sm:text-2xl md:text-[1.75rem]">
            Calculadoras
          </p>
          <div className="mt-0.5">
            <CasioMark size="hero" />
          </div>
          <p className="mt-2 max-w-[11rem] text-[11px] leading-snug text-white/75 sm:mt-3 sm:max-w-[15rem] sm:text-[13px] md:max-w-[17rem] md:text-sm">
            Rendimiento que te acompaña en cada cálculo
          </p>
          <a
            href="#catalogo"
            className="mt-3 inline-flex w-fit items-center gap-1 rounded-lg bg-casio-lime px-3.5 py-2 text-[11px] font-bold tracking-wide text-black hover:bg-casio-lime-bright sm:mt-5 sm:rounded-xl sm:px-5 sm:py-3 sm:text-sm"
          >
            VER CATÁLOGO
            <span aria-hidden className="text-base leading-none">
              ›
            </span>
          </a>
        </div>

        <div className="absolute bottom-2.5 right-2.5 z-20 sm:bottom-3 sm:right-3 md:bottom-4 md:right-4">
          <div className="hero-offer-frame flex w-max max-w-[min(17rem,calc(100vw-2rem))] items-stretch overflow-hidden rounded-[0.85rem] border border-white/12 bg-black/82 sm:max-w-none">
            <div className="flex shrink-0 items-center bg-casio-cream px-2.5 py-2 sm:px-3 sm:py-2.5">
              <span className="text-[10px] font-extrabold leading-none text-black sm:text-xs">10% OFF</span>
            </div>
            <div className="flex items-center px-2.5 py-2 sm:px-3">
              <div>
                <p className="text-[8px] font-bold uppercase leading-tight tracking-wide text-white sm:text-[10px]">
                  Oferta en compras
                </p>
                <p className="text-[7px] uppercase leading-tight tracking-wide text-white/65 sm:text-[9px]">
                  en productos seleccionados
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center pr-2.5 text-casio-lime sm:pr-3">
              <svg viewBox="0 0 24 24" className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" aria-hidden>
                <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58s1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41s-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function CasioStorefront({
  categories,
  supabaseUrl,
  whatsappE164,
  tiktokUrl = 'https://www.tiktok.com',
  instagramUrl = 'https://www.instagram.com',
  facebookUrl = 'https://www.facebook.com',
}: Props) {
  const [activeSlug, setActiveSlug] = useState<string | null>(null)

  const visibleCategories = useMemo(() => {
    if (!activeSlug) return categories
    return categories.filter((c) => c.slug === activeSlug)
  }, [categories, activeSlug])

  const totalProducts = categories.reduce((n, c) => n + c.products.length, 0)

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-casio-bg pb-28 text-casio-text sm:max-w-xl md:max-w-3xl md:pb-12 lg:max-w-5xl">
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
            <SocialIcon href={tiktokUrl} label="TikTok">
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-current" aria-hidden>
                <path d="M14.5 3c.4 2.4 1.8 4.1 4.2 4.5v2.3c-1.4 0-2.7-.5-3.8-1.3v6.6c0 3.4-2.7 6.1-6.1 6.1S2.7 18.5 2.7 15.1c0-3.3 2.6-6 5.9-6.1v2.4c-2 .1-3.5 1.7-3.5 3.7 0 2 1.7 3.7 3.7 3.7s3.7-1.7 3.7-3.7V3h2z" />
              </svg>
            </SocialIcon>
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
            <HeaderIcon href="/admin/login" label="Mi cuenta" className="hidden sm:flex">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2" aria-hidden>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </HeaderIcon>
            <HeaderIcon href="#catalogo" label="Carrito" badge="2" className="hidden sm:flex">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2" aria-hidden>
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            </HeaderIcon>
          </div>
        </div>
      </header>

      <div className="px-3 pt-2 sm:px-6 sm:pt-3 lg:px-8">
        <HeroBanner />
      </div>

      <section className="mt-7 px-4 sm:px-6 lg:px-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-casio text-xl tracking-[0.12em] text-casio-lime md:text-2xl">CATEGORÍAS</h2>
          <button
            type="button"
            onClick={() => setActiveSlug(null)}
            className="text-[11px] font-semibold text-casio-lime hover:underline sm:text-xs"
          >
            VER TODO ›
          </button>
        </div>

        <div className="scrollbar-none -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 md:mx-0 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:px-0">
          {categories.map((cat) => {
            const count = cat.products.length
            const thumb = cat.products.find((p) => p.image_path)?.image_path
            const imgUrl = productImagePublicUrl(supabaseUrl, thumb)
            const selected = activeSlug === cat.slug
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveSlug(selected ? null : cat.slug)}
                className={`w-[7.5rem] shrink-0 overflow-hidden rounded-2xl border text-left transition md:w-auto ${
                  selected ? 'border-casio-lime/70 bg-casio-card' : 'border-white/10 bg-casio-card hover:border-casio-lime/40'
                }`}
              >
                <div className="relative flex h-[5.5rem] items-end justify-center overflow-hidden bg-[#0d0d0d] px-2 pt-3 md:h-[7rem]">
                  {imgUrl ? (
                    <Image
                      src={imgUrl}
                      alt=""
                      width={90}
                      height={90}
                      className="h-[4.5rem] w-auto object-contain drop-shadow-lg md:h-[5.5rem]"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center pb-2">
                      <CasioMark size="sm" className="opacity-30" />
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

      <section id="catalogo" className="mt-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-casio text-xl tracking-[0.12em] text-casio-lime md:text-2xl">PRODUCTOS</h2>
          <span className="text-[10px] text-casio-muted sm:text-xs">{totalProducts} en catálogo</span>
        </div>

        {totalProducts === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 px-6 py-12 text-center">
            <CasioMark size="md" className="justify-center opacity-30" />
            <p className="mt-3 text-sm text-casio-muted">Todavía no hay productos cargados.</p>
          </div>
        ) : (
          visibleCategories.map((cat) =>
            cat.products.length === 0 ? null : (
              <div key={cat.id} className="mb-8 md:mb-10">
                {!activeSlug ? (
                  <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-white/70 sm:text-xs">{cat.name}</h3>
                ) : null}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {cat.products.map((p) => {
                    const imgUrl = productImagePublicUrl(supabaseUrl, p.image_path)
                    return (
                      <article
                        key={p.id}
                        className="overflow-hidden rounded-2xl border border-white/10 bg-casio-card transition hover:border-casio-lime/30"
                      >
                        <div className="relative flex aspect-[4/5] items-end justify-center bg-[#0a0a0a] px-3 pt-4">
                          {imgUrl ? (
                            <Image
                              src={imgUrl}
                              alt={p.name}
                              width={140}
                              height={140}
                              className="max-h-[85%] w-auto object-contain drop-shadow-md"
                              unoptimized
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <CasioMark size="sm" className="opacity-20" />
                            </div>
                          )}
                        </div>
                        <div className="border-t border-white/5 p-3 sm:p-4">
                          <h4 className="line-clamp-2 text-xs font-semibold leading-snug sm:text-sm">{p.name}</h4>
                          <p className="mt-2 text-sm font-bold text-casio-lime sm:text-base">{formatMoneyArs(p.price)}</p>
                        </div>
                      </article>
                    )
                  })}
                </div>
              </div>
            ),
          )
        )}
      </section>

      <nav className="safe-bottom fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-casio-bg/95 backdrop-blur-md md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around px-1 py-1.5">
          <a href="#" aria-current="page">
            <NavIcon active label="Inicio">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
              </svg>
            </NavIcon>
          </a>
          <a href="#catalogo">
            <NavIcon label="Guardados">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </NavIcon>
          </a>
          <a href="#catalogo">
            <NavIcon label="Buscar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </NavIcon>
          </a>
          <a href="#catalogo">
            <NavIcon label="Pedidos">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
              </svg>
            </NavIcon>
          </a>
          <Link href="/admin/login">
            <NavIcon label="Más">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" />
              </svg>
            </NavIcon>
          </Link>
        </div>
      </nav>
    </div>
  )
}
