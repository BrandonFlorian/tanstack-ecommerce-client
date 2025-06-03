import React from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, ShoppingBag } from 'lucide-react'
import { useCart, useClearCart, useCartReadyState } from '@/hooks/useCart'
import { CartItemCard } from '@/components/CartItemCard'
import { CartSummary } from '@/components/CartSummary'
import { useSessionStore } from '@/stores/sessionStore'
import { useEffect } from 'react'

export const Route = createFileRoute('/cart')({
  component: CartPage,
})

function CartPage() {
  const { data: cart, isLoading, error } = useCart()
  const clearCart = useClearCart()
  const { isReady, isLoading: authLoading } = useCartReadyState()
  const { ensureUser, session, isInitialized } = useSessionStore()
  const navigate = useNavigate()
  // Ensure we have a user when visiting cart page
  useEffect(() => {
    if (isInitialized && !session) {
      console.log('Cart page: No session found, ensuring user exists')
      ensureUser()
    }
  }, [isInitialized, session, ensureUser])

  const handleCheckout = () => {
    navigate({ to: '/checkout' })
  }

  const handleClearCart = () => {
    if (!isReady) return
    if (window.confirm('Are you sure you want to clear your cart?')) {
      clearCart.mutate()
    }
  }

  // Show loading while auth is initializing or user is being created
  if (!isInitialized || authLoading || !isReady) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
            <div>
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
          <div className="text-center mt-4 text-muted-foreground">
            Setting up your cart...
          </div>
        </div>
      </div>
    )
  }

  // Show loading while cart data is loading
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
            <div>
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Error Loading Cart</h1>
          <p className="text-muted-foreground mb-4">{error.message}</p>
          <Link to="/products">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const isEmpty = !cart?.items?.length

  if (isEmpty) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <ShoppingBag className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8">
            Looks like you haven't added anything to your cart yet.
          </p>
          <Link to="/products">
            <Button size="lg">
              Start Shopping
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link to="/products" className="text-muted-foreground hover:text-foreground flex items-center mb-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continue Shopping
            </Link>
            <h1 className="text-3xl font-bold">Shopping Cart</h1>
            <p className="text-muted-foreground">
              {cart.summary.totalItems} {cart.summary.totalItems === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
          
          {cart.items.length > 0 && (
            <Button 
              variant="outline" 
              onClick={handleClearCart}
              disabled={clearCart.isPending}
            >
              {clearCart.isPending ? 'Clearing...' : 'Clear Cart'}
            </Button>
          )}
        </div>

        {/* Cart Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Items in your cart</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.items.map((item) => (
                  <CartItemCard key={item.id} item={item} />
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <CartSummary onCheckout={handleCheckout} />
          </div>
        </div>
      </div>
    </div>
  )
}