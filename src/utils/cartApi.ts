import { createServerFn } from '@tanstack/react-start'
import { ApiServerClient } from '@/lib/apiServerClient'
import { getSupabaseServerClient } from '@/utils/supabase'
import { EXPRESS_SERVER_URL_WITH_PORT } from '@/config/constants'
import type { CartWithItems, AddToCartRequest, UpdateCartItemRequest } from '@/types/cart'

// Enhanced API client with better error handling
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

    console.log('🌐 Cart API request:', { 
      path, 
      method: options.method || 'GET',
      hasToken: !!this.token,
      body: options.body ? JSON.parse(options.body as string) : undefined
    })

    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    })
    
    if (!res.ok) {
      const errorText = await res.text()
      console.error('❌ Cart API error:', errorText)
      throw new Error(errorText)
    }
    
    const result = await res.json()
    console.log('✅ Cart API response:', { path, result })
    return result
  }
}

// Get current cart
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
      console.log('Cart fetched successfully for user:', session.user.id)
      return response.data
    } catch (error) {
      console.error('Failed to fetch cart:', error)
      throw error
    }
  })

// Add item to cart
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
      console.log('Item added to cart successfully for user:', session.user.id)
      return response.data
    } catch (error) {
      console.error('Failed to add to cart:', error)
      throw error
    }
  })

// Update cart item quantity
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
      console.log('Cart item updated successfully for user:', session.user.id)
      return response.data
    } catch (error) {
      console.error('Failed to update cart item:', error)
      throw error
    }
  })

// Remove item from cart
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
      console.log('Cart item removed successfully for user:', session.user.id)
      return response.data
    } catch (error) {
      console.error('Failed to remove from cart:', error)
      throw error
    }
  })

// Clear entire cart
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
      console.log('Cart cleared successfully for user:', session.user.id)
      return response.data
    } catch (error) {
      console.error('Failed to clear cart:', error)
      throw error
    }
  })

// Manual cart merge for anonymous users - Enhanced with debugging
export const mergeAnonymousCart = createServerFn({ method: 'POST' })
  .validator((data: { anonymousUserId: string }) => data)
  .handler(async ({ data }) => {
    console.log('🔀 MERGE API: Starting merge request with data:', data)
    
    const supabase = getSupabaseServerClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    console.log('🔀 MERGE API: Current session:', {
      userId: session?.user?.id,
      isAnonymous: session?.user?.is_anonymous,
      email: session?.user?.email
    })
    
    if (!session || session.user.is_anonymous) {
      const error = 'Cannot merge to anonymous user'
      console.error('❌ MERGE API:', error)
      throw new Error(error)
    }
    
    const api = new CartApiClient(EXPRESS_SERVER_URL_WITH_PORT, session.access_token)
    
    try {
      console.log('🔀 MERGE API: Making request to /api/cart/merge')
      const response = await api.post<{ data: CartWithItems, status: string }>(
        '/api/cart/merge', 
        { fromUserId: data.anonymousUserId }
      )
      console.log('✅ MERGE API: Merge completed successfully:', response)
      return response.data
    } catch (error) {
      console.error('❌ MERGE API: Failed to merge anonymous cart:', error)
      throw error
    }
  })