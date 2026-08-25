import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_TITLE, siteUrl } from '@/lib/seo'
import type { Metadata } from 'next'
import { Bebas_Neue, DM_Sans, Michroma, Playfair_Display } from 'next/font/google'
import { AppProviders } from './providers'
import './globals.css'

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
})

const bebasNeue = Bebas_Neue({
  variable: '--font-bebas-neue',
  weight: '400',
  subsets: ['latin'],
})

const michroma = Michroma({
  variable: '--font-michroma',
  weight: '400',
  subsets: ['latin'],
})

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['italic', 'normal'],
})

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${SITE_TITLE} | ${SITE_NAME}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  icons: {
    icon: '/brand/logo.jpeg',
    apple: '/brand/logo.jpeg',
  },
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    siteName: SITE_NAME,
    title: `${SITE_TITLE} | ${SITE_NAME}`,
    description: DEFAULT_DESCRIPTION,
    images: [{ url: '/brand/banner4k.png', width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_TITLE} | ${SITE_NAME}`,
    description: DEFAULT_DESCRIPTION,
    images: ['/brand/banner4k.png'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const whatsappE164 = process.env.NEXT_PUBLIC_WHATSAPP_E164

  return (
    <html
      suppressHydrationWarning
      lang="es"
      className={`${dmSans.variable} ${bebasNeue.variable} ${michroma.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <AppProviders supabaseUrl={supabaseUrl} whatsappE164={whatsappE164}>
          {children}
        </AppProviders>
      </body>
    </html>
  )
}
