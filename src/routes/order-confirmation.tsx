import { createFileRoute } from '@tanstack/react-router'
import { OrderConfirmation } from '@/components/OrderConfirmation'

export const Route = createFileRoute('/order-confirmation')({
  component: OrderConfirmationPage,
})

function OrderConfirmationPage() {
  return <OrderConfirmation />
}