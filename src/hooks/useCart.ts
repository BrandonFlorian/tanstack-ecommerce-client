import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { 
  fetchCart, 
  addToCart, 
  updateCartItem, 
  removeFromCart, 
  clearCart,
  mergeAnonymousCart
} from '@/utils/cartApi'
import type { CartWithItems, AddToCartRequest, UpdateCartItemRequest } from '@/types/cart'
import { useSessionStore, useIsReady, useUserId } from '@/stores/sessionStore'

// Main cart hook with enhanced user transition handling
export function useCart(options?: Partial<UseQueryOptions<CartWithItems, Error>>) {
  const userId = useUserId()
  const isReady = useIsReady()
  const queryClient = useQueryClient()
  const prevUserIdRef = useRef<string | null>(null)

  // Handle cart merging via custom events
  useEffect(() => {
    const handleCartMerge = async (event: Event) => {
      const { anonymousUserId, newUserId } = (event as CustomEvent).detail
      
      console.log('🔀 Cart Hook: Handling cart merge event:', {
        from: anonymousUserId,
        to: newUserId
      })
      
      try {
        // Clear old cart data immediately
        queryClient.removeQueries({ queryKey: ['cart', anonymousUserId] })
        queryClient.removeQueries({ queryKey: ['cart'] })
        
        // Trigger merge on backend
        await mergeAnonymousCart({ data: { anonymousUserId } })
        
        // Invalidate new user's cart to fetch merged data
        queryClient.invalidateQueries({ queryKey: ['cart', newUserId] })
        
        // Clear the anonymous user tracking
        useSessionStore.getState().clearAnonymousUserId()
        
        console.log('✅ Cart merge completed successfully')
      } catch (error) {
        console.error('❌ Cart merge failed:', error)
        // Fallback: just invalidate the cart
        queryClient.invalidateQueries({ queryKey: ['cart', newUserId] })
      }
    }

    const handleLogout = () => {
      console.log('🧹 Cart Hook: Handling logout, clearing all cart cache')
      queryClient.removeQueries({ queryKey: ['cart'] })
    }

    // Listen for auth events
    window.addEventListener('auth:cart-merge-needed', handleCartMerge)
    window.addEventListener('auth:logged-out', handleLogout)

    return () => {
      window.removeEventListener('auth:cart-merge-needed', handleCartMerge)
      window.removeEventListener('auth:logged-out', handleLogout)
    }
  }, [queryClient])

  // Handle user changes with immediate cache clearing
  useEffect(() => {
    const prevUserId = prevUserIdRef.current
    
    if (userId !== prevUserId) {
      console.log('🔄 Cart Hook: User changed from', prevUserId, 'to', userId)
      
      if (prevUserId) {
        // Immediately remove old user's cart data
        queryClient.removeQueries({ queryKey: ['cart', prevUserId] })
        console.log('🗑️ Cart Hook: Removed old cart cache for', prevUserId)
      }
      
      prevUserIdRef.current = userId
      
      if (userId && isReady) {
        console.log('🔍 Cart Hook: Prefetching cart for new user', userId)
        // Prefetch instead of invalidate for smoother UX
        queryClient.prefetchQuery({
          queryKey: ['cart', userId],
          queryFn: () => fetchCart({ data: undefined }),
        })
      }
    }
  }, [userId, isReady, queryClient])

  return useQuery({
    queryKey: ['cart', userId],
    queryFn: () => {
      console.log('🛒 Cart Hook: Fetching cart for user', userId)
      return fetchCart({ data: undefined })
    },
    enabled: isReady && !!userId,
    staleTime: 1000 * 30, // 30 seconds
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch on mount to avoid flash
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('Cart not found')) {
        return false
      }
      return failureCount < 2
    },
    ...options,
  })
}

// Add to cart mutation with optimistic updates
export function useAddToCart() {
  const queryClient = useQueryClient()
  const userId = useUserId()
  const isReady = useIsReady()

  return useMutation({
    mutationFn: (data: Omit<AddToCartRequest, 'sessionId'>) => {
      if (!isReady || !userId) {
        throw new Error('User not ready')
      }
      console.log('➕ Cart Hook: Adding to cart for user', userId)
      return addToCart({ data })
    },
    onMutate: async (variables) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['cart', userId] })
      
      const previousCart = queryClient.getQueryData(['cart', userId])
      
      // Optimistically update the cart
      queryClient.setQueryData(['cart', userId], (old: CartWithItems | undefined) => {
        if (!old) return old
        
        // Find if item already exists
        const existingItemIndex = old.items.findIndex(
          item => item.products.id === variables.product_id
        )
        
        if (existingItemIndex >= 0) {
          // Update existing item
          const newItems = [...old.items]
          newItems[existingItemIndex] = {
            ...newItems[existingItemIndex],
            quantity: newItems[existingItemIndex].quantity + variables.quantity
          }
          
          return {
            ...old,
            items: newItems,
            summary: {
              ...old.summary,
              totalItems: old.summary.totalItems + variables.quantity,
              subtotal: old.summary.subtotal + (newItems[existingItemIndex].products.price * variables.quantity)
            }
          }
        }
        
        return old // Let the server response handle new items
      })
      
      return { previousCart }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousCart) {
        queryClient.setQueryData(['cart', userId], context.previousCart)
      }
    },
    onSuccess: (newCartData) => {
      if (userId) {
        console.log('✅ Cart Hook: Add successful, updating cache')
        queryClient.setQueryData(['cart', userId], newCartData)
      }
    }
  })
}

// Update cart item mutation
export function useUpdateCartItem() {
  const queryClient = useQueryClient()
  const userId = useUserId()
  const isReady = useIsReady()

  return useMutation({
    mutationFn: (data: { itemId: string; updates: UpdateCartItemRequest }) => {
      if (!isReady || !userId) {
        throw new Error('User not ready')
      }
      return updateCartItem({ data })
    },
    onSuccess: (newCartData) => {
      if (userId) {
        queryClient.setQueryData(['cart', userId], newCartData)
      }
    }
  })
}

// Remove from cart mutation
export function useRemoveFromCart() {
  const queryClient = useQueryClient()
  const userId = useUserId()
  const isReady = useIsReady()

  return useMutation({
    mutationFn: (itemId: string) => {
      if (!isReady || !userId) {
        throw new Error('User not ready')
      }
      return removeFromCart({ data: { itemId, action: 'remove' } })
    },
    onSuccess: (newCartData) => {
      if (userId) {
        queryClient.setQueryData(['cart', userId], newCartData)
      }
    }
  })
}

// Clear cart mutation
export function useClearCart() {
  const queryClient = useQueryClient()
  const userId = useUserId()
  const isReady = useIsReady()

  return useMutation({
    mutationFn: () => {
      if (!isReady || !userId) {
        throw new Error('User not ready')
      }
      return clearCart({ data: { action: 'clear' } })
    },
    onSuccess: (newCartData) => {
      if (userId) {
        queryClient.setQueryData(['cart', userId], newCartData)
      }
    }
  })
}

// Cart ready state
export function useCartReadyState() {
  const isReady = useIsReady()
  const { isLoading, session } = useSessionStore()
  
  return { 
    isReady,
    isLoading,
    isAnonymous: session?.user?.is_anonymous || false,
  }
}

// Cart summary with enhanced memoization
export function useCartSummary() {
  const { data: cart, isLoading } = useCart()
  const { isReady } = useCartReadyState()
  
  return {
    itemCount: cart?.summary?.totalItems || 0,
    subtotal: cart?.summary?.subtotal || 0,
    isEmpty: !cart?.items?.length,
    isReady: isReady && !isLoading,
  }
}