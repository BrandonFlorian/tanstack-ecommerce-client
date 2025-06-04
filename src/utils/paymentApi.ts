import { ApiServerClient } from "@/lib/apiServerClient"
import { getServerSessionForApi } from "./supabase"
import { EXPRESS_SERVER_URL_WITH_PORT } from "@/config/constants"
import { createServerFn } from "@tanstack/react-start"
import { Address } from "@/types/user"
import { CreateAddressData } from "@/types/payment"
import { UpdateAddressData } from "@/types/payment"

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
  .validator((data: CreateAddressData) => data)
  .handler(async ({ data }) => {
    const session = await getServerSessionForApi()
    if (!session) throw new Error('Not authenticated')
    
    const api = new ApiServerClient(EXPRESS_SERVER_URL_WITH_PORT, session.access_token)
    const response = await api.post<{ data: Address }>('/api/users/me/addresses', data)
    return response.data
  })

export const updateAddress = createServerFn({ method: 'POST' })
  .validator((data: UpdateAddressData) => data)
  .handler(async ({ data }) => {
    const session = await getServerSessionForApi()
    if (!session) throw new Error('Not authenticated')
    
    const { id, ...updateData } = data
    const api = new ApiServerClient(EXPRESS_SERVER_URL_WITH_PORT, session.access_token)
    const response = await api.put<{ data: Address }>(`/api/users/me/addresses/${id}`, updateData)
    return response.data
  })

export const deleteAddress = createServerFn({ method: 'POST' })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    const session = await getServerSessionForApi()
    if (!session) throw new Error('Not authenticated')
    
    const api = new ApiServerClient(EXPRESS_SERVER_URL_WITH_PORT, session.access_token)
    const response = await api.delete<{ data: { success: boolean } }>(`/api/users/me/addresses/${id}`)
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
    console.log("payment intent data", data)
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
