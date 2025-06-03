import { CheckCircle, Package, Truck } from "lucide-react"

import { AlertCircle, XCircle } from "lucide-react"
import { Badge } from "./ui/badge"

export function OrderStatusBadge({ status }: { status: string }) {
    const statusConfig = {
      pending: { label: 'Pending', variant: 'secondary' as const, icon: AlertCircle },
      paid: { label: 'Paid', variant: 'default' as const, icon: CheckCircle },
      processing: { label: 'Processing', variant: 'secondary' as const, icon: Package },
      shipped: { label: 'Shipped', variant: 'default' as const, icon: Truck },
      delivered: { label: 'Delivered', variant: 'default' as const, icon: CheckCircle },
      cancelled: { label: 'Cancelled', variant: 'destructive' as const, icon: XCircle },
      refunded: { label: 'Refunded', variant: 'outline' as const, icon: AlertCircle },
      payment_failed: { label: 'Payment Failed', variant: 'destructive' as const, icon: XCircle },
      disputed: { label: 'Disputed', variant: 'destructive' as const, icon: AlertCircle },
      flagged_for_review: { label: 'Under Review', variant: 'destructive' as const, icon: AlertCircle },
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      variant: 'outline' as const,
      icon: AlertCircle
    }
    
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }