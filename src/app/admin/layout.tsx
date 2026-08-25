import { pageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = pageMetadata({
  title: 'Admin',
  noIndex: true,
})

export default function AdminRoot({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
