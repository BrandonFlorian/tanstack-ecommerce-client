import React from 'react'
import { Link } from '@tanstack/react-router'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'
import { AddToCartButton } from '@/components/AddToCartButton'
import type { Product } from '@/types/product'

interface ProductCardProps {
  product: Product
  showAddToCart?: boolean
  className?: string
}

export function ProductCard({ product, showAddToCart = true, className }: ProductCardProps) {
  const primaryImage = product.product_images?.find(img => img.is_primary) || product.product_images?.[0]
  const isOutOfStock = product.inventory_quantity <= 0

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  return (
    <Card className={`group overflow-hidden transition-all hover:shadow-lg ${className}`}>
      <Link to="/products/$productId" params={{ productId: product.id }}>
        <div className="relative aspect-square overflow-hidden">
          {primaryImage ? (
            <img
              src={primaryImage.url}
              alt={primaryImage.alt_text}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-100">
              <span className="text-gray-400">No image</span>
            </div>
          )}
          
          {isOutOfStock && (
            <Badge variant="destructive" className="absolute top-2 left-2">
              Out of Stock
            </Badge>
          )}
          
          {product.compare_at_price && product.compare_at_price > product.price && (
            <Badge variant="secondary" className="absolute top-2 right-2">
              Sale
            </Badge>
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        <Link to="/products/$productId" params={{ productId: product.id }}>
          <h3 className="font-semibold text-lg line-clamp-2 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
          {product.description}
        </p>
        
        <div className="flex items-center gap-2 mt-3">
          <span className="font-bold text-lg">
            {formatPrice(product.price)}
          </span>
          {product.compare_at_price && product.compare_at_price > product.price && (
            <span className="text-muted-foreground line-through text-sm">
              {formatPrice(product.compare_at_price)}
            </span>
          )}
        </div>
      </CardContent>

      {showAddToCart && (
        <CardFooter className="p-4 pt-0 flex gap-2">
          <AddToCartButton product={product} className="flex-1" />
          <Button 
            variant="outline" 
            size="icon"
            onClick={(e) => {
              e.preventDefault()
              // TODO: Add to wishlist functionality
              console.log('Add to wishlist:', product.id)
            }}
          >
            <Heart className="h-4 w-4" />
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}