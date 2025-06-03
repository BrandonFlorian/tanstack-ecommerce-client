import { Badge, CheckCircle, Package, Truck } from "lucide-react"
import { MapPin } from "lucide-react"
import { Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Skeleton } from "./ui/skeleton"
import { trackShipment } from "@/utils/orderApi"
import { useQuery } from "@tanstack/react-query"

interface OrderTrackingProps {
    carrier: string
    trackingNumber: string
    orderId: string
  }
  
  export function OrderTracking({ carrier, trackingNumber, orderId }: OrderTrackingProps) {
    const { data: tracking, isLoading, error } = useQuery({
      queryKey: ['tracking', carrier, trackingNumber],
      queryFn: () => trackShipment({ data: { carrier, trackingNumber } }),
      refetchInterval: 1000 * 60 * 5, // Refresh every 5 minutes
      enabled: !!carrier && !!trackingNumber
    })
  
    if (isLoading) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Package Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </CardContent>
        </Card>
      )
    }
  
    if (error || !tracking) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Package Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Tracking information not available yet. Please check back later.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Tracking Number: {trackingNumber}
              </p>
            </div>
          </CardContent>
        </Card>
      )
    }
  
    const getStatusIcon = (status: string) => {
      switch (status) {
        case 'delivered':
          return <CheckCircle className="h-5 w-5 text-green-600" />
        case 'in_transit':
          return <Truck className="h-5 w-5 text-blue-600" />
        default:
          return <Package className="h-5 w-5 text-gray-600" />
      }
    }
  
    const getStatusBadge = (status: string) => {
      const statusConfig = {
        'pre_transit': { label: 'Label Created', variant: 'secondary' as const },
        'in_transit': { label: 'In Transit', variant: 'default' as const },
        'delivered': { label: 'Delivered', variant: 'default' as const },
        'returned': { label: 'Returned', variant: 'destructive' as const },
        'failure': { label: 'Delivery Failed', variant: 'destructive' as const },
        'unknown': { label: 'Unknown', variant: 'outline' as const }
      }
      
      const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.unknown
      return <Badge>{config.label}</Badge>
    }
  
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Package Tracking</CardTitle>
            {getStatusBadge(tracking.status)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Tracking Summary */}
            <div className="flex items-start gap-4">
              {getStatusIcon(tracking.status)}
              <div className="flex-1">
                <p className="font-medium text-lg">{tracking.status_details || 'Package is being tracked'}</p>
                <p className="text-sm text-muted-foreground">
                  Tracking Number: {tracking.tracking_number}
                </p>
                <p className="text-sm text-muted-foreground">
                  Carrier: {tracking.carrier.toUpperCase()}
                </p>
                {tracking.estimated_delivery && (
                  <p className="text-sm text-muted-foreground">
                    Estimated Delivery: {formatDate(tracking.estimated_delivery)}
                  </p>
                )}
              </div>
            </div>
  
            {/* Tracking Timeline */}
            {tracking.tracking_events && tracking.tracking_events.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Tracking History</h4>
                <div className="space-y-4">
                  {tracking.tracking_events.map((event: any, index: number) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          index === 0 ? 'bg-primary text-primary-foreground' : 'bg-gray-100'
                        }`}>
                          {event.status === 'delivered' ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : event.status === 'in_transit' ? (
                            <Truck className="h-5 w-5" />
                          ) : (
                            <Package className="h-5 w-5" />
                          )}
                        </div>
                        {index < tracking.tracking_events.length - 1 && (
                          <div className="w-0.5 h-16 bg-gray-200 mt-2" />
                        )}
                      </div>
                      <div className="flex-1 pb-8">
                        <p className="font-medium">{event.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          {event.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {event.location}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(event.date)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
  
            {/* Carrier Tracking Link */}
            <div className="pt-4 border-t">
              <a
                href={`https://tools.usps.com/go/TrackConfirmAction?qtc_tLabels1=${trackingNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                Track on {carrier.toUpperCase()} website →
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }