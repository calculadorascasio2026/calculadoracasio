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

const STORAGE_KEY = 'casio-show-prices'

type PriceVisibilityContextValue = {
  showPrices: boolean
  setShowPrices: (value: boolean) => void
  toggleShowPrices: () => void
}

const PriceVisibilityContext = createContext<PriceVisibilityContextValue | null>(null)

export function PriceVisibilityProvider({ children }: { children: ReactNode }) {
  // Por defecto ocultos: el cliente no quiere mostrar precios
  const [showPrices, setShowPricesState] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw === '1') setShowPricesState(true)
      if (raw === '0') setShowPricesState(false)
    } catch {
      /* ignore */
    }
    setReady(true)
  }, [])

  const setShowPrices = useCallback((value: boolean) => {
    setShowPricesState(value)
    try {
      localStorage.setItem(STORAGE_KEY, value ? '1' : '0')
    } catch {
      /* ignore */
    }
  }, [])

  const toggleShowPrices = useCallback(() => {
    setShowPrices(!showPrices)
  }, [setShowPrices, showPrices])

  const value = useMemo(
    () => ({ showPrices: ready ? showPrices : false, setShowPrices, toggleShowPrices }),
    [ready, showPrices, setShowPrices, toggleShowPrices],
  )

  return <PriceVisibilityContext.Provider value={value}>{children}</PriceVisibilityContext.Provider>
}

export function usePriceVisibility() {
  const ctx = useContext(PriceVisibilityContext)
  if (!ctx) {
    return {
      showPrices: false,
      setShowPrices: () => {},
      toggleShowPrices: () => {},
    }
  }
  return ctx
}
