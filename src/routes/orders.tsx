import { createFileRoute } from '@tanstack/react-router'
import { OrderHistory } from '@/components/OrderHistory'

export const Route = createFileRoute('/orders')({
  component: OrderHistoryPage,
})

function OrderHistoryPage() {
  return <OrderHistory />
}