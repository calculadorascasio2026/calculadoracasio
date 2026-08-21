'use client'

import { AddToCartButton } from '@/components/add-to-cart-button'
import { CasioMark } from '@/components/casio-mark'
import { ProductDetailModal } from '@/components/product-detail-modal'
import { formatMoneyArs } from '@/lib/format'
import { productImagePublicUrl } from '@/lib/image-url'
import type { ProductRow } from '@/types/catalog'
import Image from 'next/image'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const INTERVAL_MS = 3200
const SCROLL_IDLE_MS = 180
/** Cantidad mínima de slides para que el carrusel se sienta infinito también en desktop. */
const MIN_SLIDES = 12

type Props = {
  products: ProductRow[]
  supabaseUrl: string
}

type Slide = { product: ProductRow; key: string; uniqueIndex: number }

export function FeaturedProductsCarousel({ products, supabaseUrl }: Props) {
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
  const [detail, setDetail] = useState<ProductRow | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const slideRefs = useRef<(HTMLDivElement | null)[]>([])
  const programmaticScrollRef = useRef(false)
  const scrollIdleRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const pauseBriefly = useCallback((ms = 2400) => {
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current)
    setPaused(true)
    resumeTimeoutRef.current = setTimeout(() => setPaused(false), ms)
  }, [])

  const openProduct = useCallback(
    (product: ProductRow) => {
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current)
      setPaused(true)
      setDetail(product)
    },
    [],
  )

  const closeProduct = useCallback(() => {
    setDetail(null)
    pauseBriefly(2000)
  }, [pauseBriefly])

  const goTo = useCallback(
    (i: number) => {
      if (n === 0) return
      pauseBriefly()
      setIndex(((i % n) + n) % n)
    },
    [n, pauseBriefly],
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

  const autoplayPaused = paused || detail !== null

  useEffect(() => {
    if (n <= 1 || autoplayPaused || userScrolling || !inView || reduceMotion) return
    const id = window.setInterval(() => setIndex((i) => (i + 1) % n), INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [n, autoplayPaused, userScrolling, inView, reduceMotion])

  useEffect(() => {
    const track = trackRef.current
    const slide = slideRefs.current[index]
    if (!track || !slide || userScrolling) return

    const maxLeft = Math.max(0, track.scrollWidth - track.clientWidth)
    if (maxLeft <= 0 && n > 1) return

    const targetLeft = slide.offsetLeft - (track.clientWidth - slide.offsetWidth) / 2
    programmaticScrollRef.current = true
    track.scrollTo({
      left: Math.max(0, Math.min(targetLeft, maxLeft)),
      behavior: reduceMotion ? 'auto' : 'smooth',
    })
    const t = window.setTimeout(() => {
      programmaticScrollRef.current = false
    }, 700)
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

  const activeUnique = slides[index]?.uniqueIndex ?? 0

  return (
    <div ref={rootRef} className="relative w-full">
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
          onTouchStart={() => pauseBriefly(2800)}
        >
          {slides.map((slide, i) => {
            const { product } = slide
            const imgUrl = productImagePublicUrl(supabaseUrl, product.image_path)
            const active = i === index
            return (
              <div
                key={slide.key}
                ref={(el) => {
                  slideRefs.current[i] = el
                }}
                className="w-[42%] min-w-[9.5rem] max-w-[11.5rem] shrink-0 snap-center sm:w-[30%] sm:min-w-[11rem] sm:max-w-[12.5rem] md:w-[22%] md:min-w-[12rem] md:max-w-[13rem]"
                aria-hidden={!active}
              >
                <article
                  className={`overflow-hidden rounded-2xl border bg-casio-card transition duration-300 ${
                    active ? 'scale-100 border-casio-lime/40 opacity-100' : 'scale-[0.92] border-white/10 opacity-50'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => openProduct(product)}
                    className="relative flex h-36 w-full items-end justify-center bg-[#0a0a0a] px-2 pt-3 text-left sm:h-40"
                    aria-label={`Ver detalle de ${product.name}`}
                  >
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
                  </button>
                  <div className="border-t border-white/5 p-2.5">
                    <button
                      type="button"
                      onClick={() => openProduct(product)}
                      className="w-full text-left"
                    >
                      <h3 className="line-clamp-2 text-[11px] font-semibold leading-snug sm:text-xs">{product.name}</h3>
                      <p className="mt-1.5 text-xs font-bold text-casio-lime sm:text-sm">
                        {formatMoneyArs(product.price)}
                      </p>
                    </button>
                    <AddToCartButton
                      productId={product.id}
                      name={product.name}
                      unitPrice={product.price}
                      imagePath={product.image_path}
                      className="mt-1.5"
                      label="Agregar"
                    />
                  </div>
                </article>
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

      {detail ? (
        <ProductDetailModal product={detail} supabaseUrl={supabaseUrl} onClose={closeProduct} />
      ) : null}
    </div>
  )
}
