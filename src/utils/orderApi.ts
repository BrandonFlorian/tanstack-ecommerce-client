import { createServerFn } from "@tanstack/react-start";
import { getServerSessionForApi } from "./supabase";
import { EXPRESS_SERVER_URL_WITH_PORT } from "@/config/constants";
import { ApiServerClient } from "@/lib/apiServerClient";
import { Order, OrdersResponse } from "@/types/order";

export const fetchUserOrders = createServerFn({ method: 'GET' })
  .validator((params?: { page?: number; limit?: number; status?: string }) => params || {})
  .handler(async ({ data: params }) => {
    const session = await getServerSessionForApi()
    if (!session) throw new Error('Not authenticated')
    
    const api = new ApiServerClient(EXPRESS_SERVER_URL_WITH_PORT, session.access_token)
    
    const queryParams = new URLSearchParams()
    if (params.page) queryParams.append('page', params.page.toString())
    if (params.limit) queryParams.append('limit', params.limit.toString())
    if (params.status) queryParams.append('status', params.status)
    
    const queryString = queryParams.toString()
    const url = `/api/orders/my-orders${queryString ? `?${queryString}` : ''}`
    
    return await api.get<OrdersResponse>(url)
  })

  export const fetchOrderDetails = createServerFn({ method: 'GET' })
  .validator((orderId: string) => orderId)
  .handler(async ({ data: orderId }) => {
    const session = await getServerSessionForApi()
    if (!session) throw new Error('Not authenticated')
    
    const api = new ApiServerClient(EXPRESS_SERVER_URL_WITH_PORT, session.access_token)
    const response = await api.get<{ data: Order }>(`/api/orders/${orderId}`)
    return response.data
  })

export const trackShipment = createServerFn({ method: 'GET' })
  .validator((data: { carrier: string; trackingNumber: string }) => data)
  .handler(async ({ data }) => {
    const session = await getServerSessionForApi()
    if (!session) throw new Error('Not authenticated')
    
    const api = new ApiServerClient(EXPRESS_SERVER_URL_WITH_PORT, session.access_token)
    const response = await api.get<{ data: any }>(
      `/api/shipping/tracking/${data.trackingNumber}?carrier=${data.carrier}`
    )
    return response.data
  })


  export const fetchOrderByPaymentIntent = createServerFn({ method: 'GET' })
  .validator((paymentIntentId: string) => paymentIntentId)
  .handler(async ({ data: paymentIntentId }) => {
    const session = await getServerSessionForApi()
    if (!session) throw new Error('Not authenticated')
    
    const api = new ApiServerClient(EXPRESS_SERVER_URL_WITH_PORT, session.access_token)
    
    // First, check payment status
    const paymentResponse = await api.get<{ 
      data: { 
        status: string
        paymentIntentId: string 
      } 
    }>(`/api/payment/payment-status/${paymentIntentId}`)
    
    if (paymentResponse.data.status !== 'succeeded') {
      throw new Error('Payment not completed')
    }
    
    // Then fetch the order
    const orderResponse = await api.get<{ 
      data: {
        order: any
        items: any[]
      } 
    }>(`/api/orders/by-payment-intent/${paymentIntentId}`)
    
    return orderResponse.data
  })