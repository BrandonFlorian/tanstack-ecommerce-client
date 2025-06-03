import { Package } from "lucide-react"

export function OrderItemCard({ item }: { item: any }) {
    const product = item.products
    const primaryImage = product.product_images?.find((img: any) => img.is_primary) || product.product_images?.[0]
    
    const formatPrice = (price: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(price / 100)
    }
  
    return (
      <div className="flex gap-4 py-4 border-b last:border-0">
        <div className="w-20 h-20 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
          {primaryImage ? (
            <img
              src={primaryImage.url}
              alt={primaryImage.alt_text}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-8 w-8 text-gray-400" />
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <h4 className="font-medium">{product.name}</h4>
          <p className="text-sm text-muted-foreground">
            Quantity: {item.quantity}
          </p>
          <p className="text-sm">
            {formatPrice(item.unit_price)} each
          </p>
        </div>
        
        <div className="text-right">
          <p className="font-semibold">{formatPrice(item.total_price)}</p>
        </div>
      </div>
    )
  }