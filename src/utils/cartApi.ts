import { createServerFn } from '@tanstack/react-start'
import { ApiServerClient } from '@/lib/apiServerClient'
import { getSupabaseServerClient } from '@/utils/supabase'
import { EXPRESS_SERVER_URL_WITH_PORT } from '@/config/constants'
import type { CartWithItems, AddToCartRequest, UpdateCartItemRequest } from '@/types/cart'

// Simplified API client - no need for session ID headers anymore
class CartApiClient extends ApiServerClient {
  constructor(baseUrl: string, token?: string) {
    super(baseUrl, token)
  }

  async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers = {
      ...(options.headers || {}),
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      'Content-Type': 'application/json',
    }

    console.log('Cart API request:', { 
      path, 
      method: options.method || 'GET',
      hasToken: !!this.token,
      headers: Object.keys(headers)
    })

    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    })
    
    if (!res.ok) {
      const errorText = await res.text()
      console.error('Cart API error:', errorText)
      throw new Error(errorText)
    }
    
    return res.json()
  }
}

// Get current cart - simplified
export const fetchCart = createServerFn({ method: 'GET' })
  .validator(() => ({}))
  .handler(async () => {
    const supabase = getSupabaseServerClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      throw new Error('No user session found')
    }
    
    const api = new CartApiClient(EXPRESS_SERVER_URL_WITH_PORT, session.access_token)
    
    try {
      const response = await api.get<{ data: CartWithItems, status: string }>('/api/cart')
      return response.data
    } catch (error) {
      console.error('Failed to fetch cart:', error)
      throw error
    }
  })

// Add item to cart - simplified
export const addToCart = createServerFn({ method: 'POST' })
  .validator((data: Omit<AddToCartRequest, 'sessionId'>) => data)
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      throw new Error('No user session found')
    }
    
    const api = new CartApiClient(EXPRESS_SERVER_URL_WITH_PORT, session.access_token)
    
    try {
      const response = await api.post<{ data: CartWithItems, status: string }>('/api/cart/items', data)
      return response.data
    } catch (error) {
      console.error('Failed to add to cart:', error)
      throw error
    }
  })

// Update cart item quantity - simplified
export const updateCartItem = createServerFn({ method: 'POST' })
  .validator((data: { itemId: string; updates: UpdateCartItemRequest }) => data)
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      throw new Error('No user session found')
    }
    
    const api = new CartApiClient(EXPRESS_SERVER_URL_WITH_PORT, session.access_token)
    
    try {
      const response = await api.put<{ data: CartWithItems, status: string }>(
        `/api/cart/items/${data.itemId}`, 
        data.updates
      )
      return response.data
    } catch (error) {
      console.error('Failed to update cart item:', error)
      throw error
    }
  })

// Remove item from cart - simplified
export const removeFromCart = createServerFn({ method: 'POST' })
  .validator((data: { itemId: string; action: 'remove' }) => data)
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      throw new Error('No user session found')
    }
    
    const api = new CartApiClient(EXPRESS_SERVER_URL_WITH_PORT, session.access_token)
    
    try {
      const response = await api.delete<{ data: CartWithItems, status: string }>(
        `/api/cart/items/${data.itemId}`
      )
      return response.data
    } catch (error) {
      console.error('Failed to remove from cart:', error)
      throw error
    }
  })

// Clear entire cart - simplified
export const clearCart = createServerFn({ method: 'POST' })
  .validator((data: { action: 'clear' }) => data)
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      throw new Error('No user session found')
    }
    
    const api = new CartApiClient(EXPRESS_SERVER_URL_WITH_PORT, session.access_token)
    
    try {
      const response = await api.delete<{ data: CartWithItems, status: string }>('/api/cart')
      return response.data
    } catch (error) {
      console.error('Failed to clear cart:', error)
      throw error
    }
  })

// Manual cart merge for anonymous users - required by Supabase docs
export const mergeAnonymousCart = createServerFn({ method: 'POST' })
  .validator((data: { anonymousUserId: string }) => data)
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session || session.user.is_anonymous) {
      throw new Error('Cannot merge to anonymous user')
    }
    
    const api = new CartApiClient(EXPRESS_SERVER_URL_WITH_PORT, session.access_token)
    
    try {
      // Call your server endpoint to merge the anonymous cart into the real user's cart
      const response = await api.post<{ data: CartWithItems, status: string }>(
        '/api/cart/merge', 
        { fromUserId: data.anonymousUserId }
      )
      return response.data
    } catch (error) {
      console.error('Failed to merge anonymous cart:', error)
      throw error
    }
  })

// Legacy merge function - no longer needed with manual approach
export const mergeSessionCart = createServerFn({ method: 'POST' })
  .validator((data: { sessionId: string }) => data)
  .handler(async ({ data }) => {
    // This is handled manually now
    console.log('Legacy merge function - use mergeAnonymousCart instead')
    return null
  })