'use client'
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

interface CartItem {
  productId: number
  name: string
  price: number
  image: string
  quantity: number
  slug: string
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
  updateQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
  cartCount: number
  cartOpen: boolean
  setCartOpen: (open: boolean) => void
  user: User | null
  setUser: (user: User | null) => void
  deliveryFee: number
  setDeliveryFee: (fee: number) => void
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

  useEffect(() => {
    const saved = localStorage.getItem('laay_cart')
    if (saved) setCart(JSON.parse(saved))
  }, [])

  useEffect(() => {
    localStorage.setItem('laay_cart', JSON.stringify(cart))
  }, [cart])

  const addToCart = useCallback((item: Omit<CartItem, 'quantity'>) => {
    setCart(prev => {
      const existing = prev.find(i => i.productId === item.productId)
      if (existing) return prev.map(i => i.productId === item.productId ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { ...item, quantity: 1 }]
    })
    setCartOpen(true)
  }, [])

  const removeFromCart = useCallback((productId: number) => {
    setCart(prev => prev.filter(i => i.productId !== productId))
  }, [])

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    if (quantity <= 0) { removeFromCart(productId); return }
    setCart(prev => prev.map(i => i.productId === productId ? { ...i, quantity } : i))
  }, [removeFromCart])

  const clearCart = useCallback(() => setCart([]), [])

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <AppContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartOpen, setCartOpen, user, setUser, deliveryFee, setDeliveryFee }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
