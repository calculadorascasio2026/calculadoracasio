'use client'

import { CartProvider } from '@/context/cart-context'
import { PriceVisibilityProvider } from '@/context/price-visibility-context'
import { StoreCartDrawer } from '@/components/store-cart-drawer'
import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  supabaseUrl: string
  whatsappE164?: string
}

export function AppProviders({ children, supabaseUrl, whatsappE164 }: Props) {
  return (
    <CartProvider>
      <PriceVisibilityProvider>
        {children}
        <StoreCartDrawer supabaseUrl={supabaseUrl} whatsappE164={whatsappE164} />
      </PriceVisibilityProvider>
    </CartProvider>
  )
}
