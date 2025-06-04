import { Address } from "./user"

export interface PaymentIntent {
  clientSecret: string
  paymentIntentId: string
  amount: number
  subtotal: number
  tax: number
  shipping: number
  currency: string
}

export interface ShippingRate {
  rate_id: string // Shippo rate ID
  service_code: string
  service_name: string
  carrier: string
  rate: number
  estimated_days: number
  zone?: string
}

export type CreateAddressData = Omit<Address, 'id' | 'created_at' | 'updated_at' | 'user_id'>
export type UpdateAddressData = Partial<CreateAddressData> & { id: string }