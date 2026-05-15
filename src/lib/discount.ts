export interface CartItem {
  productId: number
  name: string
  price: number
  image: string
  quantity: number
  slug: string
}

export interface DiscountResult {
  bulkDiscount: number       // 5% if 3+ items
  deliveryDiscount: number   // 5% if paying delivery in advance
  couponDiscount: number     // custom% from coupon
  couponCode: string
  totalDiscountPercent: number
  subtotalDiscount: number   // amount saved in taka
  deliveryFee: number
  originalDeliveryFee: number
  finalTotal: number
  subtotal: number
}

export function calculateDiscounts(params: {
  items: CartItem[]
  paidDelivery: boolean
  couponDiscount: number
  couponCode: string
  deliveryFee: number
}): DiscountResult {
  const { items, paidDelivery, couponDiscount, couponCode, deliveryFee } = params

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  // Calculate discount percentages (additive)
  const bulkDiscount = totalItems >= 3 ? 5 : 0
  const deliveryDiscount = paidDelivery ? 5 : 0

  const totalDiscountPercent = bulkDiscount + deliveryDiscount + couponDiscount

  // Apply discount to subtotal
  const subtotalDiscount = (subtotal * totalDiscountPercent) / 100

  // Delivery fee: if paidDelivery, it's included in advance (no separate charge at delivery)
  // But the user already paid it, so we still charge delivery fee here
  // The "advance payment" means they're paying delivery fee upfront → they get 5% off subtotal
  const finalDeliveryFee = deliveryFee

  const finalTotal = subtotal - subtotalDiscount + finalDeliveryFee

  return {
    bulkDiscount,
    deliveryDiscount,
    couponDiscount,
    couponCode,
    totalDiscountPercent,
    subtotalDiscount,
    deliveryFee: finalDeliveryFee,
    originalDeliveryFee: deliveryFee,
    finalTotal: Math.max(0, finalTotal),
    subtotal,
  }
}

export function generateOrderNumber(): string {
  const date = new Date()
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `LAAY-${dateStr}-${random}`
}
