import { createFileRoute } from '@tanstack/react-router'
import { Checkout } from '@/components/Checkout'

export const Route = createFileRoute('/checkout')({
  component: CheckoutPage,
})

function CheckoutPage() {
  return <Checkout />
}