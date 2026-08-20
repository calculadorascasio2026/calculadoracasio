'use client'

import { useCart } from '@/context/cart-context'
import { useEffect, useState } from 'react'

export function CartHeaderButton({ className = '' }: { className?: string }) {
  const { itemCount, openDrawer, addAlertTick } = useCart()
  const [alerting, setAlerting] = useState(false)
  const badge = itemCount > 0 ? (itemCount > 99 ? '99+' : String(itemCount)) : undefined

  useEffect(() => {
    if (addAlertTick === 0) return
    setAlerting(true)
    const t = window.setTimeout(() => setAlerting(false), 700)
    return () => window.clearTimeout(t)
  }, [addAlertTick])

  return (
    <button
      type="button"
      onClick={openDrawer}
      className={`casio-icon-btn relative ${alerting ? 'cart-icon-alert' : ''} ${className}`}
      aria-label={itemCount > 0 ? `Carrito, ${itemCount} productos` : 'Carrito'}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2" aria-hidden>
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
      {badge ? (
        <span
          className={`absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-casio-lime px-1 text-[10px] font-bold text-black ${
            alerting ? 'cart-badge-pop' : ''
          }`}
        >
          {badge}
        </span>
      ) : null}
    </button>
  )
}
