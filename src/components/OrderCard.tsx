import { CardContent } from "./ui/card"

import { ChevronRight, DollarSign, Link, Package, Truck } from "lucide-react"
import { Calendar } from "lucide-react"
import { OrderStatusBadge } from "./OrderStatusBadge"
import { Card, CardHeader } from "./ui/card"
import { Button } from "./ui/button"

export function OrderCard({ order }: { order: any }) {
    const formatPrice = (price: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(price / 100)
    }
    
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    }
    
    const itemCount = order.order_items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0
    const firstThreeItems = order.order_items?.slice(0, 3) || []
    const remainingCount = Math.max(0, (order.order_items?.length || 0) - 3)
    
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">Order #{order.id.slice(-8).toUpperCase()}</h3>
                <OrderStatusBadge status={order.status} />
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(order.created_at)}
                </span>
                <span className="flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  {formatPrice(order.total_amount)}
                </span>
              </div>
            </div>
            <Link to={`/orders/${order.id}`}>
              <Button variant="ghost" size="icon">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {/* Product preview */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 overflow-hidden">
              {firstThreeItems.map((item: any, index: number) => {
                const product = item.products
                const primaryImage = product.product_images?.find((img: any) => img.is_primary) || product.product_images?.[0]
                
                return (
                  <div 
                    key={item.id} 
                    className="w-16 h-16 rounded border overflow-hidden bg-gray-100 flex-shrink-0"
                  >
                    {primaryImage ? (
                      <img
                        src={primaryImage.url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                )
              })}
              {remainingCount > 0 && (
                <div className="w-16 h-16 rounded border bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-gray-600">+{remainingCount}</span>
                </div>
              )}
            </div>
            
            {/* Tracking info */}
            {order.tracking_number && (
              <div className="flex items-center gap-2 text-sm">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Tracking:</span>
                <span className="font-medium">{order.tracking_number}</span>
              </div>
            )}
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-2 mt-4">
            <Link to={`/orders/${order.id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                View Details
              </Button>
            </Link>
            {order.status === 'delivered' && (
              <Button variant="outline" size="sm" className="flex-1">
                Leave Review
              </Button>
            )}
            {order.receipt_url && (
              <a 
                href={order.receipt_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button variant="outline" size="sm" className="w-full">
                  Receipt
                </Button>
              </a>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }