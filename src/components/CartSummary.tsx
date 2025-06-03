import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useCartSummary } from '@/hooks/useCart'
import { useNavigate } from '@tanstack/react-router'

interface CartSummaryProps {
  onCheckout?: () => void
  className?: string
}

export function CartSummary({ onCheckout, className }: CartSummaryProps) {
  const { subtotal, itemCount, isEmpty } = useCartSummary()
  const navigate = useNavigate()
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const handleCheckout = () => {
    if (onCheckout) {
      onCheckout()
    } else {
      // Default behavior: navigate to checkout
      navigate({ to: '/checkout' })
    }
  }
  const estimatedTax = subtotal * 0.08 // 8% tax estimate
  const estimatedShipping = subtotal > 50 ? 0 : 9.99 // Free shipping over $50
  const estimatedTotal = subtotal + estimatedTax + estimatedShipping

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal ({itemCount} items)</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Estimated Shipping</span>
            <span>{estimatedShipping === 0 ? 'Free' : formatPrice(estimatedShipping)}</span>
          </div>
          <div className="flex justify-between">
            <span>Estimated Tax</span>
            <span>{formatPrice(estimatedTax)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatPrice(estimatedTotal)}</span>
          </div>
        </div>

        {subtotal > 0 && subtotal < 50 && (
          <div className="text-sm text-muted-foreground bg-blue-50 p-2 rounded">
            Add {formatPrice(50 - subtotal)} more for free shipping!
          </div>
        )}

        <Button 
          className="w-full" 
          size="lg"
          disabled={isEmpty}
          onClick={handleCheckout}
        >
          {isEmpty ? 'Cart is Empty' : 'Proceed to Checkout'}
        </Button>
      </CardContent>
    </Card>
  )
}