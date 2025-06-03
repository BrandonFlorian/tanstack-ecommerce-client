import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { Skeleton } from "./ui/skeleton"
import { Button } from "./ui/button"
import { Link } from "@tanstack/react-router"
import { ShoppingBag } from "lucide-react"
import { Card, CardContent } from "./ui/card"
import { Package } from "lucide-react"
import { OrderCard } from "./OrderCard"
import { fetchUserOrders } from "@/utils/orderApi"
import { Order, OrdersResponse } from "@/types/order"

export function OrderHistory() {
    const [page, setPage] = useState(1)
    const [statusFilter, setStatusFilter] = useState<string>()
    
    const { data, isLoading, error } = useQuery<OrdersResponse>({
      queryKey: ['orders', page, statusFilter],
      queryFn: () => fetchUserOrders({ 
        data: { 
          page, 
          limit: 10, 
          status: statusFilter 
        } 
      }),
      staleTime: 1000 * 60 * 5, // 5 minutes
    })

    console.log("orders", data)
    
    if (isLoading) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          </div>
        </div>
      )
    }
    
    if (error) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">Error Loading Orders</h1>
            <p className="text-muted-foreground mb-4">We couldn't load your orders. Please try again.</p>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </div>
      )
    }
    
    const orders = data?.data || []
    const pagination = data?.pagination
    
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Order History</h1>
              <p className="text-muted-foreground">
                Track and manage your orders
              </p>
            </div>
            <Link to="/products">
              <Button>
                <ShoppingBag className="mr-2 h-4 w-4" />
                Continue Shopping
              </Button>
            </Link>
          </div>
          
          {orders.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
                <p className="text-muted-foreground mb-4">
                  When you place your first order, it will appear here.
                </p>
                <Link to="/products">
                  <Button>Start Shopping</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Orders list */}
              <div className="space-y-4">
                {orders.map((order: Order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
              
              {/* Pagination */}
              {pagination && pagination.total_pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  
                  <span className="text-sm text-muted-foreground mx-4">
                    Page {page} of {pagination.total_pages}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => p + 1)}
                    disabled={page === pagination.total_pages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    )
  }