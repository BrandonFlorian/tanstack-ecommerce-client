import React from 'react'
import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { useProduct } from '@/hooks/useProducts'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ShoppingCart, Heart, ArrowLeft } from 'lucide-react'
import { fetchProduct } from '@/utils/productApi'
import { AddToCartButton } from '@/components/AddToCartButton'

export const Route = createFileRoute('/products/$productId')({
  loader: async ({ params }) => {
    try {
      const product = await fetchProduct({ data: params.productId })
      return { product }
    } catch (error) {
      throw notFound()
    }
  },
  component: ProductDetailPage,
  errorComponent: ({ error }) => {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-destructive mb-4">Product Not Found</h1>
        <p className="text-muted-foreground mb-4">The product you're looking for doesn't exist.</p>
        <Link to="/products">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </Link>
      </div>
    )
  },
})

function ProductDetailPage() {
  const { productId } = Route.useParams()
  const loaderData = Route.useLoaderData()
  
  const { data: product, isLoading } = useProduct(productId, {
    initialData: loaderData.product,
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  if (isLoading || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="aspect-square w-full" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    )
  }

  const primaryImage = product.product_images?.find(img => img.is_primary) || product.product_images?.[0]
  const isOutOfStock = product.inventory_quantity <= 0
  const isOnSale = product.compare_at_price && product.compare_at_price > product.price

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link to="/products" className="text-muted-foreground hover:text-foreground flex items-center">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square relative overflow-hidden rounded-lg border">
            {primaryImage ? (
              <img
                src={primaryImage.url}
                alt={primaryImage.alt_text}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-100">
                <span className="text-gray-400">No image available</span>
              </div>
            )}
          </div>
          
          {/* Additional images thumbnail grid */}
          {product.product_images && product.product_images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.product_images.map((image) => (
                <div
                  key={image.id}
                  className="aspect-square relative overflow-hidden rounded border cursor-pointer hover:opacity-75"
                >
                  <img
                    src={image.url}
                    alt={image.alt_text}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-muted-foreground">{product.description}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold">
                {formatPrice(product.price)}
              </span>
              {isOnSale && (
                <span className="text-xl text-muted-foreground line-through">
                  {formatPrice(product.compare_at_price!)}
                </span>
              )}
            </div>
            {isOnSale && (
              <Badge variant="secondary">Sale</Badge>
            )}
          </div>

          <Card>
            <CardContent className="p-4">
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="font-medium">SKU</dt>
                  <dd className="text-muted-foreground">{product.sku}</dd>
                </div>
                <div>
                  <dt className="font-medium">Stock</dt>
                  <dd className={isOutOfStock ? 'text-destructive' : 'text-green-600'}>
                    {isOutOfStock ? 'Out of stock' : `${product.inventory_quantity} available`}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium">Weight</dt>
                  <dd className="text-muted-foreground">{product.weight}g</dd>
                </div>
                <div>
                  <dt className="font-medium">Dimensions</dt>
                  <dd className="text-muted-foreground">
                    {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height} cm
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <AddToCartButton 
                product={product}
                className="flex-1"
                showQuantitySelector={true}
              />
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => {
                // TODO: Implement wishlist
                console.log('Add to wishlist:', product.id)
              }}
            >
              <Heart className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}