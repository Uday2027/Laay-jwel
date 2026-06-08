'use client'

function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  let sid = localStorage.getItem('laay_session_id')
  if (!sid) {
    sid = crypto.randomUUID()
    localStorage.setItem('laay_session_id', sid)
  }
  return sid
}

export async function trackEvent(payload: {
  type: 'pageview' | 'product_click' | 'add_to_cart'
  url?: string
  productId?: number
  productName?: string
  productSlug?: string
  quantity?: number
}) {
  if (typeof window === 'undefined') return
  try {
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        sessionId: getSessionId(),
      }),
    })
  } catch {
    // Silently fail — analytics should never break the user experience
  }
}

export function trackPageView(url?: string) {
  trackEvent({ type: 'pageview', url: url || window.location.pathname + window.location.search })
}

export function trackProductClick(productId: number, productName: string, productSlug: string) {
  trackEvent({ type: 'product_click', productId, productName, productSlug })
}

export function trackAddToCart(productId: number, productName: string, productSlug: string, quantity: number = 1) {
  trackEvent({ type: 'add_to_cart', productId, productName, productSlug, quantity })
}
