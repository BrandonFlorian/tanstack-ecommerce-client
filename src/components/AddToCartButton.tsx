import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Plus, Minus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useAddToCart, useCartReadyState } from '@/hooks/useCart'
import type { Product } from '@/types/product'

interface AddToCartButtonProps {
  product: Product
  className?: string
  showQuantitySelector?: boolean
}

export function AddToCartButton({ 
  product, 
  className, 
  showQuantitySelector = false 
}: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1)
  const addToCart = useAddToCart()
  const { isReady, isLoading } = useCartReadyState()

  const isOutOfStock = product.inventory_quantity <= 0
  const maxQuantity = product.inventory_quantity
  const isDisabled = addToCart.isPending || isLoading || isOutOfStock

  const handleAddToCart = () => {
    if (!isReady) return
    
    addToCart.mutate({
      product_id: product.id,
      quantity
    })
  }

  const adjustQuantity = (change: number) => {
    const newQuantity = quantity + change
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity)
    }
  }

  const getButtonText = () => {
    if (isLoading) return 'Setting up cart...'
    if (addToCart.isPending) return 'Adding...'
    return 'Add to Cart'
  }

  if (isOutOfStock) {
    return (
      <Button disabled className={className}>
        Out of Stock
      </Button>
    )
  }

  if (showQuantitySelector) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => adjustQuantity(-1)}
            disabled={quantity <= 1 || isLoading}
          >
            <Minus className="h-3 w-3" />
          </Button>
          
          <Input
            type="number"
            min="1"
            max={maxQuantity}
            value={quantity}
            onChange={(e) => {
              const value = parseInt(e.target.value)
              if (!isNaN(value) && value >= 1 && value <= maxQuantity) {
                setQuantity(value)
              }
            }}
            className="w-16 h-8 text-center"
            disabled={isLoading}
          />
          
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => adjustQuantity(1)}
            disabled={quantity >= maxQuantity || isLoading}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        
        <Button 
          onClick={handleAddToCart}
          disabled={isDisabled}
          className="flex-1"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {getButtonText()}
        </Button>
      </div>
    )
  }

  return (
    <Button 
      onClick={handleAddToCart}
      disabled={isDisabled}
      className={className}
    >
      <ShoppingCart className="h-4 w-4 mr-2" />
      {getButtonText()}
    </Button>
  )
}