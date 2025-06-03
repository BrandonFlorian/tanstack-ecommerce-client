import { ApiServerClient } from "@/lib/apiServerClient"
import { getServerSessionForApi } from "./supabase"
import { EXPRESS_SERVER_URL_WITH_PORT } from "@/config/constants"
import { createServerFn } from "@tanstack/react-start"
import { Address } from "@/types/user"

// Server functions for addresses
export const fetchAddresses = createServerFn({ method: 'GET' })
  .handler(async () => {
    const session = await getServerSessionForApi()
    if (!session) throw new Error('Not authenticated')
    
    const api = new ApiServerClient(EXPRESS_SERVER_URL_WITH_PORT, session.access_token)
    const response = await api.get<{ data: Address[] }>('/api/users/me/addresses')
    return response.data
  })

export const createAddress = createServerFn({ method: 'POST' })
  .validator((data: Omit<Address, 'id' | 'created_at' | 'updated_at'>) => data)
  .handler(async ({ data }) => {
    const session = await getServerSessionForApi()
    if (!session) throw new Error('Not authenticated')
    
    const api = new ApiServerClient(EXPRESS_SERVER_URL_WITH_PORT, session.access_token)
    const response = await api.post<{ data: Address }>('/api/users/me/addresses', data)
    return response.data
  })

// Server function for creating payment intent
export const createPaymentIntent = createServerFn({ method: 'POST' })
  .validator((data: {
    cart_id: string
    shipping_address_id: string
    billing_address_id: string
    shipping_method: string
    shipping_rate_id: string
  }) => data)
  .handler(async ({ data }) => {
    const session = await getServerSessionForApi()
    if (!session) throw new Error('Not authenticated')
    
    const api = new ApiServerClient(EXPRESS_SERVER_URL_WITH_PORT, session.access_token)
    const response = await api.post<{
      data: {
        clientSecret: string
        paymentIntentId: string
        amount: number
        subtotal: number
        tax: number
        shipping: number
        currency: string
      }
    }>('/api/payment/create-payment-intent', data)
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