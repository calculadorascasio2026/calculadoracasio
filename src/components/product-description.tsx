'use client'

import { looksLikeHtml, sanitizeDescriptionHtml } from '@/lib/description-html'
import { useMemo } from 'react'

type Props = {
  description: string
  className?: string
}

export function ProductDescription({ description, className = '' }: Props) {
  const text = description.trim()
  const isHtml = looksLikeHtml(text)
  const safeHtml = useMemo(
    () => (isHtml ? sanitizeDescriptionHtml(text) : ''),
    [isHtml, text],
  )

  if (!text) return null

  if (isHtml) {
    return (
      <div
        className={`product-desc space-y-0.5 leading-relaxed [&_strong]:font-bold ${className}`}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: safeHtml }}
      />
    )
  }

  return <p className={`whitespace-pre-wrap leading-relaxed ${className}`}>{text}</p>
}
