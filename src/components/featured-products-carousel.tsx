'use client'

import { AddToCartButton } from '@/components/add-to-cart-button'
import { CasioMark } from '@/components/casio-mark'
import { formatMoneyArs } from '@/lib/format'
import { productImagePublicUrl } from '@/lib/image-url'
import type { ProductRow } from '@/types/catalog'
import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const INTERVAL_MS = 3200
const SCROLL_IDLE_MS = 180
/** Cantidad mínima de slides para que el carrusel se sienta infinito. */
const MIN_SLIDES = 8

type Props = {
  products: ProductRow[]
  supabaseUrl: string
  linkToDestacados?: boolean
}

type Slide = { product: ProductRow; key: string; uniqueIndex: number }

export function FeaturedProductsCarousel({ products, supabaseUrl, linkToDestacados = false }: Props) {
  const uniqueCount = products.length

  const slides: Slide[] = useMemo(() => {
    if (uniqueCount === 0) return []
    const copies = Math.max(1, Math.ceil(MIN_SLIDES / uniqueCount))
    const out: Slide[] = []
    for (let c = 0; c < copies; c++) {
      products.forEach((product, i) => {
        out.push({ product, key: `${product.id}-${c}-${i}`, uniqueIndex: i })
      })
    }
    return out
  }, [products, uniqueCount])

  const n = slides.length
  const [index, setIndex] = useState(0)
  const [userScrolling, setUserScrolling] = useState(false)
  const [paused, setPaused] = useState(false)
  const [inView, setInView] = useState(true)
  const [reduceMotion, setReduceMotion] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const slideRefs = useRef<(HTMLDivElement | null)[]>([])
  const programmaticScrollRef = useRef(false)
  const scrollIdleRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const goTo = useCallback(
    (i: number) => {
      if (n === 0) return
      setIndex(((i % n) + n) % n)
    },
    [n],
  )

  const syncIndexFromScroll = useCallback(() => {
    const track = trackRef.current
    if (!track || n === 0) return
    const center = track.scrollLeft + track.clientWidth / 2
    let best = 0
    let bestDist = Infinity
    for (let i = 0; i < n; i++) {
      const slide = slideRefs.current[i]
      if (!slide) continue
      const slideCenter = slide.offsetLeft + slide.offsetWidth / 2
      const dist = Math.abs(slideCenter - center)
      if (dist < bestDist) {
        bestDist = dist
        best = i
      }
    }
    setIndex(best)
  }, [n])

  const handleTrackScroll = useCallback(() => {
    if (programmaticScrollRef.current) return
    setUserScrolling(true)
    syncIndexFromScroll()
    if (scrollIdleRef.current) clearTimeout(scrollIdleRef.current)
    scrollIdleRef.current = setTimeout(() => setUserScrolling(false), SCROLL_IDLE_MS)
  }, [syncIndexFromScroll])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduceMotion(mq.matches)
    const onChange = () => setReduceMotion(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    const el = rootRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return
        setInView(entry.isIntersecting && entry.intersectionRatio >= 0.25)
      },
      { threshold: [0, 0.25, 0.5, 1] },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (n <= 1 || paused || userScrolling || !inView || reduceMotion) return
    const id = window.setInterval(() => setIndex((i) => (i + 1) % n), INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [n, paused, userScrolling, inView, reduceMotion])

  useEffect(() => {
    const track = trackRef.current
    const slide = slideRefs.current[index]
    if (!track || !slide || userScrolling) return

    const maxLeft = Math.max(0, track.scrollWidth - track.clientWidth)
    const targetLeft = slide.offsetLeft - (track.clientWidth - slide.offsetWidth) / 2
    programmaticScrollRef.current = true
    track.scrollTo({
      left: Math.max(0, Math.min(targetLeft, maxLeft)),
      behavior: reduceMotion ? 'auto' : 'smooth',
    })
    const t = window.setTimeout(() => {
      programmaticScrollRef.current = false
    }, 450)
    return () => window.clearTimeout(t)
  }, [index, userScrolling, reduceMotion, n])

  useEffect(() => {
    if (index >= n) setIndex(0)
  }, [index, n])

  useEffect(() => {
    return () => {
      if (scrollIdleRef.current) clearTimeout(scrollIdleRef.current)
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current)
    }
  }, [])

  if (uniqueCount === 0) return null

  const pause = () => {
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current)
    setPaused(true)
  }

  const activeUnique = slides[index]?.uniqueIndex ?? 0

  return (
    <div
      ref={rootRef}
      className="relative w-full"
      onMouseEnter={pause}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={pause}
      onTouchEnd={() => {
        if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current)
        resumeTimeoutRef.current = setTimeout(() => setPaused(false), 2400)
      }}
    >
      <div className="relative overflow-hidden">
        {n > 1 ? (
          <>
            <button
              type="button"
              aria-label="Producto anterior"
              onClick={() => goTo(index - 1)}
              className="absolute left-0 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-casio-surface/95 text-lg text-white shadow-lg hover:border-casio-lime/50"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Producto siguiente"
              onClick={() => goTo(index + 1)}
              className="absolute right-0 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-casio-surface/95 text-lg text-white shadow-lg hover:border-casio-lime/50"
            >
              ›
            </button>
          </>
        ) : null}

        <div
          ref={trackRef}
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-10 py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-roledescription="carrusel"
          aria-label="Productos destacados"
          onScroll={handleTrackScroll}
        >
          {slides.map((slide, i) => {
            const { product } = slide
            const imgUrl = productImagePublicUrl(supabaseUrl, product.image_path)
            const active = i === index
            const card = (
              <article
                className={`overflow-hidden rounded-2xl border bg-casio-card transition duration-300 ${
                  active ? 'scale-100 border-casio-lime/40 opacity-100' : 'scale-[0.92] border-white/10 opacity-50'
                }`}
              >
                <div className="relative flex h-36 items-end justify-center bg-[#0a0a0a] px-2 pt-3 sm:h-40">
                  {imgUrl ? (
                    <Image
                      src={imgUrl}
                      alt={product.name}
                      width={120}
                      height={120}
                      className="max-h-[90%] w-auto object-contain drop-shadow-md"
                      unoptimized
                    />
                  ) : (
                    <CasioMark size="sm" className="opacity-20" />
                  )}
                  {product.stock < 1 ? (
                    <span className="absolute left-1.5 top-1.5 rounded bg-black/80 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white/90">
                      Sin stock
                    </span>
                  ) : null}
                </div>
                <div className="border-t border-white/5 p-2.5">
                  <h3 className="line-clamp-2 text-[11px] font-semibold leading-snug sm:text-xs">{product.name}</h3>
                  <p className="mt-1.5 text-xs font-bold text-casio-lime sm:text-sm">{formatMoneyArs(product.price)}</p>
                  {!linkToDestacados ? (
                    <AddToCartButton
                      productId={product.id}
                      name={product.name}
                      unitPrice={product.price}
                      imagePath={product.image_path}
                      className="mt-1.5"
                      label="Agregar"
                    />
                  ) : null}
                </div>
              </article>
            )

            return (
              <div
                key={slide.key}
                ref={(el) => {
                  slideRefs.current[i] = el
                }}
                className="w-[42%] min-w-[9.5rem] max-w-[11.5rem] shrink-0 snap-center sm:w-[30%] sm:max-w-[12.5rem] md:w-[22%] md:max-w-[13rem]"
                aria-hidden={!active}
              >
                {linkToDestacados ? (
                  <Link href="/destacados" className="block">
                    {card}
                  </Link>
                ) : (
                  card
                )}
              </div>
            )
          })}
        </div>
      </div>

      {uniqueCount > 1 ? (
        <div className="mt-2 flex justify-center gap-2">
          {products.map((p, i) => (
            <button
              key={p.id}
              type="button"
              aria-label={`Ver ${p.name}`}
              aria-current={i === activeUnique ? 'true' : undefined}
              onClick={() => goTo(i)}
              className={`h-2 rounded-full transition-all ${
                i === activeUnique ? 'w-6 bg-casio-lime' : 'w-2 bg-white/25 hover:bg-white/40'
              }`}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
