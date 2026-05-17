'use client'
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

interface CartItem {
  productId: number
  name: string
  price: number
  image: string
  quantity: number
  slug: string
  stock: number
}

interface User {
  id: number
  name: string
  email: string
  role: string
}

interface AppContextType {
  cart: CartItem[]
  addToCart: (item: Omit<CartItem, 'quantity'>) => void
  removeFromCart: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => boolean
  clearCart: () => void
  cartCount: number
  cartOpen: boolean
  setCartOpen: (open: boolean) => void
  user: User | null
  setUser: (user: User | null) => void
  deliveryFee: number
  setDeliveryFee: (fee: number) => void
  mounted: boolean
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({
  children,
  initialUser = null,
  initialDeliveryFee = 80,
}: {
  children: React.ReactNode
  initialUser?: User | null
  initialDeliveryFee?: number
}) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [user, setUser] = useState<User | null>(initialUser)
  const [deliveryFee, setDeliveryFee] = useState(initialDeliveryFee)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('laay_cart')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Backward compat: old carts may not have stock field
        setCart(parsed.map((item: CartItem & { stock?: number }) => ({
          ...item,
          stock: typeof item.stock === 'number' ? item.stock : 999,
        })))
      } catch {
        setCart([])
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('laay_cart', JSON.stringify(cart))
  }, [cart])

  const addToCart = useCallback((item: Omit<CartItem, 'quantity'>) => {
    setCart(prev => {
      const existing = prev.find(i => i.productId === item.productId)
      if (existing) {
        const newQty = existing.quantity + 1
        if (newQty > existing.stock) {
          alert(`Only ${existing.stock} item(s) available in stock`)
          return prev
        }
        return prev.map(i => i.productId === item.productId ? { ...i, quantity: newQty } : i)
      }
      if (item.stock <= 0) {
        alert('This item is out of stock')
        return prev
      }
      return [...prev, { ...item, quantity: 1 }]
    })
    setCartOpen(true)
  }, [])

  const removeFromCart = useCallback((productId: number) => {
    setCart(prev => prev.filter(i => i.productId !== productId))
  }, [])

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    if (quantity <= 0) { removeFromCart(productId); return true }
    const item = cart.find(i => i.productId === productId)
    if (item && quantity > item.stock) {
      alert(`Only ${item.stock} item(s) available in stock`)
      return false
    }
    setCart(prev => prev.map(i => i.productId === productId ? { ...i, quantity } : i))
    return true
  }, [cart, removeFromCart])

  const clearCart = useCallback(() => setCart([]), [])

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <AppContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartOpen, setCartOpen, user, setUser, deliveryFee, setDeliveryFee, mounted }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
