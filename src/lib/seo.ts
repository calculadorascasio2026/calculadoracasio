import type { Metadata } from 'next'

export const SITE_NAME = 'Viñolo Casio'
export const SITE_TITLE = 'Calculadoras Casio en Mendoza'
export const DEFAULT_DESCRIPTION =
  'Tienda de calculadoras Casio en Mendoza. ClassWiz, científicas y más. Eduardo Viñolo — calidad y precisión desde 1981. Consultá por WhatsApp.'

/** URL pública canónica del sitio (server-side). */
export function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  )
}

type PageMetaOpts = {
  title?: string
  description?: string
  path?: string
  noIndex?: boolean
}

export function pageMetadata({ title, description, path = '', noIndex = false }: PageMetaOpts = {}): Metadata {
  const url = `${siteUrl()}${path.startsWith('/') ? path : path ? `/${path}` : ''}`
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_TITLE} | ${SITE_NAME}`
  const desc = description ?? DEFAULT_DESCRIPTION

  return {
    title: { absolute: fullTitle },
    description: desc,
    alternates: { canonical: url },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      type: 'website',
      locale: 'es_AR',
      url,
      siteName: SITE_NAME,
      title: fullTitle,
      description: desc,
      images: [{ url: '/brand/banner4k.png', width: 1200, height: 630, alt: SITE_NAME }],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: desc,
      images: ['/brand/banner4k.png'],
    },
  }
}

export function websiteJsonLd() {
  const url = siteUrl()
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url,
    description: DEFAULT_DESCRIPTION,
    inLanguage: 'es-AR',
  }
}

export function localBusinessJsonLd() {
  const url = siteUrl()
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_E164
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL
  const instagram = process.env.NEXT_PUBLIC_INSTAGRAM_URL
  const facebook = process.env.NEXT_PUBLIC_FACEBOOK_URL

  return {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: 'Eduardo Viñolo — Calculadoras Casio',
    url,
    description: DEFAULT_DESCRIPTION,
    image: `${url}/brand/banner4k.png`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Mendoza',
      addressCountry: 'AR',
    },
    ...(phone ? { telephone: `+${phone.replace(/\D/g, '')}` } : {}),
    ...(email ? { email } : {}),
    sameAs: [instagram, facebook].filter(Boolean),
  }
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  const base = siteUrl()
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${base}${item.path}`,
    })),
  }
}

export function itemListJsonLd(
  name: string,
  products: { name: string; description?: string | null; image?: string | null; url?: string }[],
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    numberOfItems: products.length,
    itemListElement: products.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Product',
        name: p.name,
        ...(p.description ? { description: p.description } : {}),
        ...(p.image ? { image: p.image } : {}),
        ...(p.url ? { url: p.url } : {}),
      },
    })),
  }
}
