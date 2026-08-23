'use client'

import Image from 'next/image'
import QRCode from 'qrcode'
import { useMemo, useState } from 'react'
import { formatMoneyArs } from '@/lib/format'
import { productImagePublicUrl } from '@/lib/image-url'
import { createClient } from '@/lib/supabase/browser'
import type { HeroPromo, ProductRow } from '@/types/catalog'
import { DEFAULT_HERO_PROMO } from '@/types/catalog'

export type OfferRow = {
  product_id: string
  discount_percent: number
  active: boolean
}

export type FeaturedRow = {
  product_id: string
  sort_order: number
  active: boolean
}

type Props = {
  products: ProductRow[]
  initialOffers: OfferRow[]
  initialFeatured: FeaturedRow[]
  initialHeroPromo: HeroPromo
  supabaseUrl: string
  siteUrl: string
}

type QrKind = 'ofertas' | 'tienda' | 'destacados'

function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  a.click()
}

export function AdminMarketingPanel({
  products,
  initialOffers,
  initialFeatured,
  initialHeroPromo,
  supabaseUrl,
  siteUrl,
}: Props) {
  const sb = useMemo(() => createClient(), [])
  const base = siteUrl.replace(/\/$/, '') || (typeof window !== 'undefined' ? window.location.origin : '')

  const [heroPromo, setHeroPromo] = useState<HeroPromo>(initialHeroPromo ?? DEFAULT_HERO_PROMO)
  const [savingHero, setSavingHero] = useState(false)
  const [offers, setOffers] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {}
    for (const o of initialOffers) map[o.product_id] = Number(o.discount_percent)
    return map
  })
  const [selectedOffers, setSelectedOffers] = useState<Set<string>>(
    () => new Set(initialOffers.map((o) => o.product_id)),
  )
  const [selectedFeatured, setSelectedFeatured] = useState<Set<string>>(
    () => new Set(initialFeatured.map((f) => f.product_id)),
  )
  const [defaultDiscount, setDefaultDiscount] = useState('10')
  const [savingOffers, setSavingOffers] = useState(false)
  const [savingFeatured, setSavingFeatured] = useState(false)
  const [offersSearch, setOffersSearch] = useState('')
  const [featuredSearch, setFeaturedSearch] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [qrUrls, setQrUrls] = useState<Partial<Record<QrKind, string>>>({})
  const [qrBusy, setQrBusy] = useState<QrKind | null>(null)

  const urls = {
    ofertas: `${base}/ofertas`,
    tienda: `${base}/`,
    destacados: `${base}/destacados`,
  }

  const filteredOfferProducts = useMemo(() => {
    const q = offersSearch.trim().toLocaleLowerCase('es')
    if (!q) return products
    return products.filter((p) => p.name.toLocaleLowerCase('es').includes(q))
  }, [products, offersSearch])

  const filteredFeaturedProducts = useMemo(() => {
    const q = featuredSearch.trim().toLocaleLowerCase('es')
    if (!q) return products
    return products.filter((p) => p.name.toLocaleLowerCase('es').includes(q))
  }, [products, featuredSearch])

  function toggleOffer(id: string) {
    setSelectedOffers((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else {
        next.add(id)
        if (offers[id] == null) {
          const d = Number(defaultDiscount) || 10
          setOffers((o) => ({ ...o, [id]: d }))
        }
      }
      return next
    })
  }

  function toggleFeatured(id: string) {
    setSelectedFeatured((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function saveHeroPromo() {
    setSavingHero(true)
    setError('')
    setMessage('')
    try {
      const payload = {
        id: 1,
        badge_text: heroPromo.badge_text.trim() || DEFAULT_HERO_PROMO.badge_text,
        title: heroPromo.title.trim() || DEFAULT_HERO_PROMO.title,
        subtitle: heroPromo.subtitle.trim() || DEFAULT_HERO_PROMO.subtitle,
        visible: heroPromo.show_offers_on_home,
        show_featured_on_home: heroPromo.show_featured_on_home,
        show_offers_on_home: heroPromo.show_offers_on_home,
        updated_at: new Date().toISOString(),
      }
      const { error: upErr } = await sb.from('hero_promo').upsert(payload)
      if (upErr) throw upErr
      setHeroPromo({
        badge_text: payload.badge_text,
        title: payload.title,
        subtitle: payload.subtitle,
        visible: payload.visible,
        show_featured_on_home: payload.show_featured_on_home,
        show_offers_on_home: payload.show_offers_on_home,
      })
      setMessage('Ajustes de marketing / home guardados.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar el badge del banner')
    } finally {
      setSavingHero(false)
    }
  }

  async function saveOffers() {
    setSavingOffers(true)
    setError('')
    setMessage('')
    try {
      const { data: existingOffers, error: listErr } = await sb.from('product_offers').select('product_id')
      if (listErr) throw listErr
      if (existingOffers && existingOffers.length > 0) {
        const { error: delErr } = await sb
          .from('product_offers')
          .delete()
          .in(
            'product_id',
            existingOffers.map((r) => r.product_id),
          )
        if (delErr) throw delErr
      }

      const rows = [...selectedOffers].map((product_id) => {
        const discount = Number(offers[product_id] ?? defaultDiscount)
        return {
          product_id,
          discount_percent: Math.min(100, Math.max(0.01, discount)),
          active: true,
        }
      })

      if (rows.length > 0) {
        const { error: insErr } = await sb.from('product_offers').insert(rows)
        if (insErr) throw insErr
      }
      setMessage(`Ofertas guardadas (${rows.length} productos).`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron guardar las ofertas')
    } finally {
      setSavingOffers(false)
    }
  }

  async function saveFeatured() {
    setSavingFeatured(true)
    setError('')
    setMessage('')
    try {
      const { data: existingFeat, error: listErr } = await sb.from('featured_products').select('product_id')
      if (listErr) throw listErr
      if (existingFeat && existingFeat.length > 0) {
        const { error: delErr } = await sb
          .from('featured_products')
          .delete()
          .in(
            'product_id',
            existingFeat.map((r) => r.product_id),
          )
        if (delErr) throw delErr
      }

      const rows = [...selectedFeatured].map((product_id, index) => ({
        product_id,
        sort_order: index + 1,
        active: true,
      }))

      if (rows.length > 0) {
        const { error: insErr } = await sb.from('featured_products').insert(rows)
        if (insErr) throw insErr
      }
      setMessage(`Destacados guardados (${rows.length} productos).`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron guardar los destacados')
    } finally {
      setSavingFeatured(false)
    }
  }

  async function generateQr(kind: QrKind) {
    setQrBusy(kind)
    setError('')
    try {
      const dataUrl = await QRCode.toDataURL(urls[kind], {
        width: 512,
        margin: 2,
        color: { dark: '#030303', light: '#ffffff' },
      })
      setQrUrls((prev) => ({ ...prev, [kind]: dataUrl }))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo generar el QR')
    } finally {
      setQrBusy(null)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-casio text-3xl tracking-wide text-casio-lime">MARKETING</h1>
        <p className="mt-1 text-sm text-casio-muted">
          Armá ofertas y destacados, y generá QR para publicidad en el local.
        </p>
      </div>

      {error ? <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p> : null}
      {message ? <p className="rounded-lg border border-casio-lime/30 bg-casio-lime/10 px-3 py-2 text-sm text-casio-lime">{message}</p> : null}

      {/* Visibilidad en home + badge */}
      <section className="space-y-4 rounded-2xl border border-white/10 bg-casio-surface p-5">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white">Página principal</h2>
          <p className="mt-1 text-xs text-casio-muted">
            Si ocultás algo acá, sigue disponible en su página (/ofertas o /destacados) y en el QR.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={heroPromo.show_offers_on_home}
              onChange={(e) =>
                setHeroPromo({
                  ...heroPromo,
                  show_offers_on_home: e.target.checked,
                  visible: e.target.checked,
                })
              }
            />
            Mostrar ofertas (badge) en el inicio
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={heroPromo.show_featured_on_home}
              onChange={(e) => setHeroPromo({ ...heroPromo, show_featured_on_home: e.target.checked })}
            />
            Mostrar destacados (carrusel) en el inicio
          </label>
        </div>

        <div className="border-t border-white/10 pt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-white/80">Textos del badge de ofertas</h3>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs text-casio-muted">Etiqueta grande (ej. 10% OFF)</label>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
              value={heroPromo.badge_text}
              onChange={(e) => setHeroPromo({ ...heroPromo, badge_text: e.target.value })}
              placeholder="10% OFF"
            />
          </div>
          <div className="hidden sm:block" />
          <div>
            <label className="text-xs text-casio-muted">Título</label>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
              value={heroPromo.title}
              onChange={(e) => setHeroPromo({ ...heroPromo, title: e.target.value })}
              placeholder="Oferta en compras"
            />
          </div>
          <div>
            <label className="text-xs text-casio-muted">Subtítulo</label>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
              value={heroPromo.subtitle}
              onChange={(e) => setHeroPromo({ ...heroPromo, subtitle: e.target.value })}
              placeholder="en productos seleccionados"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-white/10 bg-black/40 p-3">
          <p className="mb-2 text-[10px] uppercase tracking-wide text-casio-muted">Vista previa del badge</p>
          <div className="hero-offer-frame inline-flex w-max max-w-full items-stretch overflow-hidden rounded-[0.85rem] border border-white/12 bg-black/82">
            <div className="flex shrink-0 items-center bg-casio-cream px-2.5 py-2">
              <span className="text-[10px] font-extrabold leading-none text-black">
                {heroPromo.badge_text || '10% OFF'}
              </span>
            </div>
            <div className="flex items-center px-2.5 py-2">
              <div>
                <p className="text-[8px] font-bold uppercase leading-tight tracking-wide text-white">
                  {heroPromo.title || 'Oferta en compras'}
                </p>
                <p className="text-[7px] uppercase leading-tight tracking-wide text-white/65">
                  {heroPromo.subtitle || 'en productos seleccionados'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          disabled={savingHero}
          onClick={() => void saveHeroPromo()}
          className="rounded-full bg-casio-lime px-4 py-2 text-xs font-semibold text-black disabled:opacity-50"
        >
          {savingHero ? 'Guardando…' : 'Guardar página principal'}
        </button>
      </section>

      {/* 1. Ofertas */}
      <section className="space-y-4 rounded-2xl border border-white/10 bg-casio-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-white">1. Ofertas</h2>
            <p className="mt-1 text-xs text-casio-muted">
              Elegí productos, poneles un % de descuento y generá un QR hacia{' '}
              <span className="text-casio-lime">/ofertas</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-casio-muted">% por defecto</label>
            <input
              type="number"
              min="1"
              max="100"
              className="w-20 rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-sm"
              value={defaultDiscount}
              onChange={(e) => setDefaultDiscount(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <input
            type="search"
            value={offersSearch}
            onChange={(e) => setOffersSearch(e.target.value)}
            placeholder="Buscar producto para ofertas…"
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-casio-lime/40"
          />
          <div className="max-h-72 space-y-2 overflow-y-auto rounded-xl border border-white/5 p-2">
            {filteredOfferProducts.length === 0 ? (
              <p className="px-2 py-6 text-center text-xs text-casio-muted">Sin coincidencias.</p>
            ) : (
              filteredOfferProducts.map((p) => {
                const checked = selectedOffers.has(p.id)
                const img = productImagePublicUrl(supabaseUrl, p.image_path)
                return (
                  <label
                    key={p.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 ${
                      checked ? 'bg-casio-lime/10' : 'hover:bg-white/[0.03]'
                    }`}
                  >
                    <input type="checkbox" checked={checked} onChange={() => toggleOffer(p.id)} />
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white">
                      {img ? (
                        <Image src={img} alt="" width={40} height={40} className="object-contain" unoptimized />
                      ) : (
                        <span className="text-[10px] text-white/20">—</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{p.name}</p>
                      <p className="text-[11px] text-casio-muted">{formatMoneyArs(p.price)}</p>
                    </div>
                    {checked ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="1"
                          max="100"
                          className="w-16 rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-xs"
                          value={offers[p.id] ?? defaultDiscount}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) =>
                            setOffers((prev) => ({ ...prev, [p.id]: Number(e.target.value) || 0 }))
                          }
                        />
                        <span className="text-xs text-casio-muted">%</span>
                      </div>
                    ) : null}
                  </label>
                )
              })
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={savingOffers}
            onClick={() => void saveOffers()}
            className="rounded-full bg-casio-lime px-4 py-2 text-xs font-semibold text-black disabled:opacity-50"
          >
            {savingOffers ? 'Guardando…' : 'Guardar ofertas'}
          </button>
          <button
            type="button"
            disabled={qrBusy === 'ofertas'}
            onClick={() => void generateQr('ofertas')}
            className="rounded-full border border-casio-lime/40 px-4 py-2 text-xs font-semibold text-casio-lime hover:bg-casio-lime/10 disabled:opacity-50"
          >
            {qrBusy === 'ofertas' ? 'Generando…' : 'Generar QR de ofertas'}
          </button>
          <a href={urls.ofertas} target="_blank" rel="noopener noreferrer" className="text-xs text-casio-muted hover:text-casio-lime">
            Ver página →
          </a>
        </div>

        {qrUrls.ofertas ? (
          <div className="flex flex-wrap items-end gap-4 rounded-xl border border-white/10 bg-black/30 p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrUrls.ofertas} alt="QR ofertas" className="h-40 w-40 rounded-lg bg-white p-2" />
            <div className="space-y-2">
              <p className="text-xs text-casio-muted break-all">{urls.ofertas}</p>
              <button
                type="button"
                onClick={() => downloadDataUrl(qrUrls.ofertas!, 'qr-ofertas-casio.png')}
                className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-white hover:border-casio-lime/40"
              >
                Descargar PNG
              </button>
            </div>
          </div>
        ) : null}
      </section>

      {/* 2. Tienda */}
      <section className="space-y-4 rounded-2xl border border-white/10 bg-casio-surface p-5">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white">2. QR a la tienda</h2>
          <p className="mt-1 text-xs text-casio-muted">
            QR que lleva a la página principal de la tienda ({urls.tienda || '/'}).
          </p>
        </div>
        <button
          type="button"
          disabled={qrBusy === 'tienda'}
          onClick={() => void generateQr('tienda')}
          className="rounded-full border border-casio-lime/40 px-4 py-2 text-xs font-semibold text-casio-lime hover:bg-casio-lime/10 disabled:opacity-50"
        >
          {qrBusy === 'tienda' ? 'Generando…' : 'Generar QR de tienda'}
        </button>
        {qrUrls.tienda ? (
          <div className="flex flex-wrap items-end gap-4 rounded-xl border border-white/10 bg-black/30 p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrUrls.tienda} alt="QR tienda" className="h-40 w-40 rounded-lg bg-white p-2" />
            <div className="space-y-2">
              <p className="text-xs text-casio-muted break-all">{urls.tienda}</p>
              <button
                type="button"
                onClick={() => downloadDataUrl(qrUrls.tienda!, 'qr-tienda-casio.png')}
                className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-white hover:border-casio-lime/40"
              >
                Descargar PNG
              </button>
            </div>
          </div>
        ) : null}
      </section>

      {/* 3. Destacados */}
      <section className="space-y-4 rounded-2xl border border-white/10 bg-casio-surface p-5">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white">3. Destacados (local)</h2>
          <p className="mt-1 text-xs text-casio-muted">
            Productos destacados para quien entre al local. El QR abre{' '}
            <span className="text-casio-lime">/destacados</span>
          </p>
        </div>

        <div className="space-y-2">
          <input
            type="search"
            value={featuredSearch}
            onChange={(e) => setFeaturedSearch(e.target.value)}
            placeholder="Buscar producto para destacados…"
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-casio-lime/40"
          />
          <div className="max-h-72 space-y-2 overflow-y-auto rounded-xl border border-white/5 p-2">
            {filteredFeaturedProducts.length === 0 ? (
              <p className="px-2 py-6 text-center text-xs text-casio-muted">Sin coincidencias.</p>
            ) : (
              filteredFeaturedProducts.map((p) => {
                const checked = selectedFeatured.has(p.id)
                const img = productImagePublicUrl(supabaseUrl, p.image_path)
                return (
                  <label
                    key={p.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 ${
                      checked ? 'bg-casio-lime/10' : 'hover:bg-white/[0.03]'
                    }`}
                  >
                    <input type="checkbox" checked={checked} onChange={() => toggleFeatured(p.id)} />
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white">
                      {img ? (
                        <Image src={img} alt="" width={40} height={40} className="object-contain" unoptimized />
                      ) : (
                        <span className="text-[10px] text-white/20">—</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{p.name}</p>
                      <p className="text-[11px] text-casio-muted">{formatMoneyArs(p.price)}</p>
                    </div>
                  </label>
                )
              })
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={savingFeatured}
            onClick={() => void saveFeatured()}
            className="rounded-full bg-casio-lime px-4 py-2 text-xs font-semibold text-black disabled:opacity-50"
          >
            {savingFeatured ? 'Guardando…' : 'Guardar destacados'}
          </button>
          <button
            type="button"
            disabled={qrBusy === 'destacados'}
            onClick={() => void generateQr('destacados')}
            className="rounded-full border border-casio-lime/40 px-4 py-2 text-xs font-semibold text-casio-lime hover:bg-casio-lime/10 disabled:opacity-50"
          >
            {qrBusy === 'destacados' ? 'Generando…' : 'Generar QR de destacados'}
          </button>
          <a href={urls.destacados} target="_blank" rel="noopener noreferrer" className="text-xs text-casio-muted hover:text-casio-lime">
            Ver página →
          </a>
        </div>

        {qrUrls.destacados ? (
          <div className="flex flex-wrap items-end gap-4 rounded-xl border border-white/10 bg-black/30 p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrUrls.destacados} alt="QR destacados" className="h-40 w-40 rounded-lg bg-white p-2" />
            <div className="space-y-2">
              <p className="text-xs text-casio-muted break-all">{urls.destacados}</p>
              <button
                type="button"
                onClick={() => downloadDataUrl(qrUrls.destacados!, 'qr-destacados-casio.png')}
                className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-white hover:border-casio-lime/40"
              >
                Descargar PNG
              </button>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  )
}
