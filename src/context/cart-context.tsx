'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type CartLine = {
  productId: string
  name: string
  unitPrice: number
  quantity: number
  imagePath: string | null
  categoryName: string | null
}

type CartContextValue = {
  lines: CartLine[]
  itemCount: number
  subtotal: number
  drawerOpen: boolean
  /** Se incrementa al agregar un producto (para animar el ícono). */
  addAlertTick: number
  openDrawer: () => void
  closeDrawer: () => void
  toggleDrawer: () => void
  addProduct: (input: {
    productId: string
    name: string
    unitPrice: number
    imagePath?: string | null
    categoryName?: string | null
  }) => void
  setQuantity: (productId: string, quantity: number) => void
  removeLine: (productId: string) => void
  clearCart: () => void
}

const STORAGE_KEY = 'casio-cart-v1'

const CartContext = createContext<CartContextValue | null>(null)

function loadLines(): CartLine[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((row) => {
        if (!row || typeof row !== 'object') return null
        const r = row as Record<string, unknown>
        const productId = typeof r.productId === 'string' ? r.productId : ''
        const name = typeof r.name === 'string' ? r.name : ''
        const unitPrice = typeof r.unitPrice === 'number' ? r.unitPrice : Number(r.unitPrice)
        const quantity = typeof r.quantity === 'number' ? r.quantity : Number(r.quantity)
        if (!productId || !name || !Number.isFinite(unitPrice) || !Number.isFinite(quantity)) return null
        return {
          productId,
          name,
          unitPrice: Math.max(0, unitPrice),
          quantity: Math.max(1, Math.floor(quantity)),
          imagePath: typeof r.imagePath === 'string' ? r.imagePath : null,
          categoryName: typeof r.categoryName === 'string' ? r.categoryName : null,
        } satisfies CartLine
      })
      .filter((x): x is CartLine => x !== null)
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [addAlertTick, setAddAlertTick] = useState(0)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setLines(loadLines())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
  }, [lines, hydrated])

  const addProduct = useCallback(
    (input: {
      productId: string
      name: string
      unitPrice: number
      imagePath?: string | null
      categoryName?: string | null
    }) => {
      setLines((prev) => {
        const i = prev.findIndex((l) => l.productId === input.productId)
        if (i >= 0) {
          const next = [...prev]
          next[i] = { ...next[i], quantity: next[i].quantity + 1 }
          return next
        }
        return [
          ...prev,
          {
            productId: input.productId,
            name: input.name,
            unitPrice: Math.max(0, input.unitPrice),
            quantity: 1,
            imagePath: input.imagePath ?? null,
            categoryName: input.categoryName ?? null,
          },
        ]
      })
      setAddAlertTick((n) => n + 1)
    },
    [],
  )

  const setQuantity = useCallback((productId: string, quantity: number) => {
    const q = Math.floor(quantity)
    setLines((prev) => {
      if (q < 1) return prev.filter((l) => l.productId !== productId)
      return prev.map((l) => (l.productId === productId ? { ...l, quantity: q } : l))
    })
  }, [])

  const removeLine = useCallback((productId: string) => {
    setLines((prev) => prev.filter((l) => l.productId !== productId))
  }, [])

  const clearCart = useCallback(() => setLines([]), [])

  const itemCount = useMemo(() => lines.reduce((s, l) => s + l.quantity, 0), [lines])
  const subtotal = useMemo(() => lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0), [lines])

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      itemCount,
      subtotal,
      drawerOpen,
      addAlertTick,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
      toggleDrawer: () => setDrawerOpen((o) => !o),
      addProduct,
      setQuantity,
      removeLine,
      clearCart,
    }),
    [lines, itemCount, subtotal, drawerOpen, addAlertTick, addProduct, setQuantity, removeLine, clearCart],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider')
  return ctx
}
