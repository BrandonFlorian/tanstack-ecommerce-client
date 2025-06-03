import { Link } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft, 
  Truck, 
  Home, 
  CreditCard,
  FileText,
  AlertCircle
} from 'lucide-react'
import { OrderStatusBadge } from './OrderStatusBadge'
import { OrderItemCard } from './OrderItemCard'
import { OrderTracking } from './OrderTracking'
import { Order } from '@/types/order'

interface OrderDetailProps {
  order: Order & {
    order_items: Array<{
      id: string
      quantity: number
      unit_price: number
      total_price: number
      products: any
    }>
    shipping_address: any
    billing_address: any
  }
}

export function OrderDetail({ order }: OrderDetailProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price / 100)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatShippingMethod = (method: string) => {
    return method.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link 
            to="/orders" 
            className="text-muted-foreground hover:text-foreground flex items-center mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Order #{order.id.slice(-8).toUpperCase()}
              </h1>
              <p className="text-muted-foreground">
                Placed on {formatDate(order.created_at)}
              </p>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>
        </div>

        {/* Fraud Warning Alert */}
        {order.fraud_warning && (
          <Card className="mb-6 border-destructive">
            <CardHeader className="pb-3">
              <CardTitle className="text-destructive flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Security Alert
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                This order has been flagged for potential fraud and is under review.
                {order.fraud_warning_details?.fraud_type && (
                  <span className="block mt-1 font-medium">
                    Type: {order.fraud_warning_details.fraud_type}
                  </span>
                )}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Dispute Alert */}
        {order.dispute_status && (
          <Card className="mb-6 border-destructive">
            <CardHeader className="pb-3">
              <CardTitle className="text-destructive flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Payment Dispute
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                This order has an active payment dispute.
                <span className="block mt-1">
                  <span className="font-medium">Status:</span> {order.dispute_status}
                </span>
                {order.dispute_reason && (
                  <span className="block mt-1">
                    <span className="font-medium">Reason:</span> {order.dispute_reason}
                  </span>
                )}
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {order.order_items.map((item) => (
                  <OrderItemCard key={item.id} item={item} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tracking Information */}
          {order.tracking_number && order.shipping_method && (
            <OrderTracking 
              carrier={order.shipping_method}
              trackingNumber={order.tracking_number}
              orderId={order.id}
            />
          )}

          {/* Delivery Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-1">
                  <p className="font-medium">{order.shipping_address.name}</p>
                  <p className="text-muted-foreground">
                    {order.shipping_address.address_line1}
                    {order.shipping_address.address_line2 && (
                      <><br />{order.shipping_address.address_line2}</>
                    )}
                  </p>
                  <p className="text-muted-foreground">
                    {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
                  </p>
                  <p className="text-muted-foreground">{order.shipping_address.country}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Billing Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-1">
                  <p className="font-medium">{order.billing_address.name}</p>
                  <p className="text-muted-foreground">
                    {order.billing_address.address_line1}
                    {order.billing_address.address_line2 && (
                      <><br />{order.billing_address.address_line2}</>
                    )}
                  </p>
                  <p className="text-muted-foreground">
                    {order.billing_address.city}, {order.billing_address.state} {order.billing_address.postal_code}
                  </p>
                  <p className="text-muted-foreground">{order.billing_address.country}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Shipping & Payment Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Shipping Method</p>
                    <p className="font-medium">{formatShippingMethod(order.shipping_method)}</p>
                  </div>
                  {order.tracking_number && (
                    <div>
                      <p className="text-muted-foreground">Tracking Number</p>
                      <p className="font-medium">{order.tracking_number}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <p className="font-medium">
                      {order.status === 'shipped' && 'In Transit'}
                      {order.status === 'delivered' && 'Delivered'}
                      {!['shipped', 'delivered'].includes(order.status) && 'Preparing for shipment'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Payment Method</p>
                    <p className="font-medium capitalize">
                      {order.payment_method_details?.type || 'Card'} ending in{' '}
                      {order.payment_method_details?.card?.last4 || '****'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Payment ID</p>
                    <p className="font-mono text-xs">{order.stripe_payment_intent_id}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{formatPrice(order.shipping_cost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatPrice(order.tax)}</span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="text-green-600">-{formatPrice(order.discount_amount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold text-base">
                  <span>Total</span>
                  <span>{formatPrice(order.total_amount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Order Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{order.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            {order.receipt_url && (
              <a 
                href={order.receipt_url} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Download Receipt
                </Button>
              </a>
            )}
            <Link to="/products">
              <Button>
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}