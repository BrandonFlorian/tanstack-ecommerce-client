import React from 'react'
import { Link } from '@tanstack/react-router'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2, Plus, Minus } from 'lucide-react'
import { useUpdateCartItem, useRemoveFromCart, useCartReadyState } from '@/hooks/useCart'
import type { CartItem } from '@/types/cart'

interface CartItemCardProps {
  item: CartItem
  className?: string
}

export function CartItemCard({ item, className }: CartItemCardProps) {
  const updateCartItem = useUpdateCartItem()
  const removeFromCart = useRemoveFromCart()
  const { isReady, isLoading } = useCartReadyState()

  const product = item.products
  const primaryImage = product.product_images?.find(img => img.is_primary) || product.product_images?.[0]

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const handleQuantityChange = (newQuantity: number) => {
    if (!isReady) return
    if (newQuantity < 1) return
    if (newQuantity > product.inventory_quantity) return
    
    updateCartItem.mutate({
      itemId: item.id,
      updates: { quantity: newQuantity }
    })
  }

  const handleRemove = () => {
    if (!isReady) return
    removeFromCart.mutate(item.id)
  }

  const itemTotal = product.price * item.quantity
  const isDisabled = isLoading || updateCartItem.isPending || removeFromCart.isPending

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Product Image */}
          <Link to="/products/$productId" params={{ productId: product.id }}>
            <div className="w-20 h-20 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
              {primaryImage ? (
                <img
                  src={primaryImage.url}
                  alt={primaryImage.alt_text}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                  No Image
                </div>
              )}
            </div>
          </Link>

          {/* Product Details */}
          <div className="flex-1 min-w-0">
            <Link 
              to="/products/$productId" 
              params={{ productId: product.id }}
              className="font-medium text-sm hover:text-primary transition-colors line-clamp-2"
            >
              {product.name}
            </Link>
            <p className="text-sm text-muted-foreground mt-1">
              SKU: {product.sku}
            </p>
            <div className="flex items-center justify-between mt-2">
              <span className="font-semibold">
                {formatPrice(product.price)}
              </span>
              <span className="text-sm text-muted-foreground">
                Total: {formatPrice(itemTotal)}
              </span>
            </div>
          </div>

          {/* Quantity Controls */}
          <div className="flex flex-col items-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-destructive hover:text-destructive"
              onClick={handleRemove}
              disabled={isDisabled}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
            
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6"
                onClick={() => handleQuantityChange(item.quantity - 1)}
                disabled={item.quantity <= 1 || isDisabled}
              >
                <Minus className="h-3 w-3" />
              </Button>
              
              <Input
                type="number"
                min="1"
                max={product.inventory_quantity}
                value={item.quantity}
                onChange={(e) => {
                  const value = parseInt(e.target.value)
                  if (!isNaN(value)) {
                    handleQuantityChange(value)
                  }
                }}
                className="w-16 h-6 text-center text-sm"
                disabled={isDisabled}
              />
              
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6"
                onClick={() => handleQuantityChange(item.quantity + 1)}
                disabled={item.quantity >= product.inventory_quantity || isDisabled}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            
            {item.quantity >= product.inventory_quantity && (
              <span className="text-xs text-orange-600">Max stock</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}