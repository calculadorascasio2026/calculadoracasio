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
  title: 'Viñolo Casio — Calculadoras',
  description: 'Catálogo de calculadoras Casio. Calidad y precisión.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      suppressHydrationWarning
      lang="es"
      className={`${dmSans.variable} ${bebasNeue.variable} ${michroma.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  )
}
