// src/hooks/useCart.ts
import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query'
import { useSession } from '@/hooks/useSession'
import { useEffect, useRef, useCallback } from 'react'
import { 
  fetchCart, 
  addToCart, 
  updateCartItem, 
  removeFromCart, 
  clearCart,
  mergeAnonymousCart
} from '@/utils/cartApi'
import type { CartWithItems, AddToCartRequest, UpdateCartItemRequest } from '@/types/cart'
import { getSupabaseBrowserClient } from '@/utils/supabase'
import { useAuthStore } from '@/stores/authStore'

// Cart hook with proper state management
export function useCart(options?: Partial<UseQueryOptions<CartWithItems, Error>>) {
  const { session } = useSession()
  const queryClient = useQueryClient()
  const { ensureUser, isReady } = useAuthStore()

  // Ensure user exists before any cart operations
  useEffect(() => {
    ensureUser()
  }, [ensureUser])

  // Handle session changes
  useEffect(() => {
    if (!session) {
      // Clear cart data on logout
      queryClient.removeQueries({ queryKey: ['cart'] })
    } else {
      // Invalidate cart when session changes
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    }
  }, [session?.user?.id, queryClient])

  return useQuery({
    queryKey: ['cart', session?.user?.id],
    queryFn: () => fetchCart({ data: undefined }),
    enabled: isReady && !!session?.user?.id,
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true,
    retry: (failureCount, error) => {
      // Don't retry on 404 (cart not found)
      if (error instanceof Error && error.message.includes('Cart not found')) {
        return false
      }
      return failureCount < 2
    },
    ...options,
  })
}

// Mutations
export function useAddToCart() {
  const queryClient = useQueryClient()
  const { session } = useSession()
  const { isReady } = useAuthStore()

  return useMutation({
    mutationFn: (data: Omit<AddToCartRequest, 'sessionId'>) => {
      if (!isReady || !session?.user?.id) {
        throw new Error('User not ready')
      }
      return addToCart({ data })
    },
    onSuccess: (newCartData) => {
      queryClient.setQueryData(['cart', session?.user?.id], newCartData)
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
    onError: (error) => {
      console.error('Failed to add to cart:', error)
    }
  })
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient()
  const { session } = useSession()
  const { isReady } = useAuthStore()

  return useMutation({
    mutationFn: (data: { itemId: string; updates: UpdateCartItemRequest }) => {
      if (!isReady || !session?.user?.id) {
        throw new Error('User not ready')
      }
      return updateCartItem({ data })
    },
    onSuccess: (newCartData) => {
      queryClient.setQueryData(['cart', session?.user?.id], newCartData)
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    }
  })
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient()
  const { session } = useSession()
  const { isReady } = useAuthStore()

  return useMutation({
    mutationFn: (itemId: string) => {
      if (!isReady || !session?.user?.id) {
        throw new Error('User not ready')
      }
      return removeFromCart({ data: { itemId, action: 'remove' } })
    },
    onSuccess: (newCartData) => {
      queryClient.setQueryData(['cart', session?.user?.id], newCartData)
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    }
  })
}

export function useClearCart() {
  const queryClient = useQueryClient()
  const { session } = useSession()
  const { isReady } = useAuthStore()

  return useMutation({
    mutationFn: () => {
      if (!isReady || !session?.user?.id) {
        throw new Error('User not ready')
      }
      return clearCart({ data: { action: 'clear' } })
    },
    onSuccess: (newCartData) => {
      queryClient.setQueryData(['cart', session?.user?.id], newCartData)
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    }
  })
}

// Utility hooks
export function useCartReadyState() {
  const { isReady, isLoading } = useAuthStore()
  const { session } = useSession()
  
  return { 
    isReady,
    isLoading,
    isAnonymous: session?.user?.is_anonymous || false,
  }
}

export function useCartSummary() {
  const { data: cart } = useCart()
  const { isReady } = useCartReadyState()
  
  return {
    itemCount: cart?.summary?.totalItems || 0,
    subtotal: cart?.summary?.subtotal || 0,
    isEmpty: !cart?.items?.length,
    isReady,
  }
}