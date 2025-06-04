import { ArrowRight, Badge, CheckCircle, Home, Link, Mail, Package } from "lucide-react"
import { CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { OrderItemCard } from "./OrderItemCard"
import { Skeleton } from "./ui/skeleton"
import { fetchOrderByPaymentIntent } from "@/utils/orderApi"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useSearch } from "@tanstack/react-router"
import { useUserId } from "@/stores/sessionStore"
import { useEffect } from "react"

export function OrderConfirmation() {
  const queryClient = useQueryClient()
  const userId = useUserId()  
  const search = useSearch({ from: '__root__' })
  const paymentIntentId = (search as any)?.payment_intent


    
    const { data: orderData, isLoading, error } = useQuery({
      queryKey: ['order-confirmation', paymentIntentId],
      queryFn: () => fetchOrderByPaymentIntent({ data: paymentIntentId! }),
      enabled: !!paymentIntentId,
      retry: 3, // Retry a few times as order creation might be async
      retryDelay: 1000, // Fixed delay instead of exponential
      staleTime: 1000 * 60 * 5, // Cache for 5 minutes
      refetchOnWindowFocus: false, 
    })

    useEffect(() => {
      if (orderData && userId) {
        // Clear the cart cache to update the icon badge
        queryClient.invalidateQueries({ queryKey: ['cart', userId] })
        // Also set empty cart data to prevent flash
        queryClient.setQueryData(['cart', userId], {
          cart: null,
          items: [],
          summary: { subtotal: 0, totalItems: 0 }
        })
      }
    }, [orderData, userId, queryClient])

    console.log("orderData", orderData)
    
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
    
    if (!paymentIntentId) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">Invalid Order</h1>
            <p className="text-muted-foreground mb-4">No payment information found.</p>
            <Link to="/products">
              <Button>Continue Shopping</Button>
            </Link>
          </div>
        </div>
      )
    }
    
    if (isLoading) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-12 w-64 mx-auto mb-8" />
            <div className="grid gap-6">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </div>
      )
    }
    
    if (error || !orderData) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">Order Not Found</h1>
            <p className="text-muted-foreground mb-4">
              We couldn't find your order. It may still be processing. Please check your email for confirmation.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/orders">
                <Button variant="outline">View Orders</Button>
              </Link>
              <Link to="/products">
                <Button>Continue Shopping</Button>
              </Link>
            </div>
          </div>
        </div>
      )
    }
    
    const { order, items } = orderData
    
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Success message */}
          <div className="text-center mb-8">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
            <p className="text-muted-foreground">
              Thank you for your purchase. We've sent a confirmation email to your address.
            </p>
          </div>
          
          {/* Order details */}
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Order Details</CardTitle>
                  <Badge className="bg-green-500 text-white">Paid</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Order Number</p>
                    <p className="font-medium">{order?.id}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Order Date</p>
                    <p className="font-medium">{formatDate(order?.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Payment Method</p>
                    <p className="font-medium capitalize">
                      {order.payment_method_details?.type || 'Card'} ending in {order.payment_method_details?.card?.last4 || '****'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Amount</p>
                    <p className="font-medium">{formatPrice(order.total_amount)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Order items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  {items.map((item) => (
                    <OrderItemCard key={item.id} item={item} />
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Delivery information */}
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
                    <p className="font-medium">{order?.shipping_address?.name}</p>
                    <p className="text-muted-foreground">
                      {order?.shipping_address?.address_line1}
                      {order?.shipping_address?.address_line2 && (
                        <><br />{order?.shipping_address?.address_line2}</>
                      )}
                    </p>
                    <p className="text-muted-foreground">
                      {order?.shipping_address?.city}, {order?.shipping_address?.state} {order?.shipping_address?.postal_code}
                    </p>
                    <p className="text-muted-foreground">{order?.shipping_address?.country}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Shipping Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-2">
                    <p className="font-medium capitalize">{order.shipping_method.replace('_', ' ')}</p>
                    <p className="text-muted-foreground">
                      Estimated delivery: 5-7 business days
                    </p>
                    {order.tracking_number && (
                      <p className="text-muted-foreground">
                        Tracking: <span className="font-medium">{order?.tracking_number}</span>
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Order summary */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(order?.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{formatPrice(order?.shipping_cost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span>{formatPrice(order.tax)}</span>
                  </div>
                  {order?.discount_amount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="text-green-600">-{formatPrice(order?.discount_amount)}</span>
                    </div>  
                  )}
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>{formatPrice(order?.total_amount)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/orders">
                <Button variant="outline" className="w-full sm:w-auto">
                  <Mail className="mr-2 h-4 w-4" />
                  View All Orders
                </Button>
              </Link>
              <Link to="/products">
                <Button className="w-full sm:w-auto">
                  Continue Shopping
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            {/* Receipt link */}
            {order?.receipt_url && (
              <div className="text-center">
                <a 
                  href={order?.receipt_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  Download Receipt
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    )
}