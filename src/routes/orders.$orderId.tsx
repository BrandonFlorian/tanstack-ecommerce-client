import { OrderDetail } from '@/components/OrderDetail'
import { fetchOrderDetails } from '@/utils/orderApi'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/orders/$orderId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { orderId } = Route.useParams()
  const { data: order } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => fetchOrderDetails({ data: orderId }),
  })
  return <OrderDetail order={order} />
}
