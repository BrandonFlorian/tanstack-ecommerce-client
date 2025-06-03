import { Address } from "./user"

export interface Order {
  id: string
  user_id?: string
  status: OrderStatus
  total_amount: number
  subtotal: number
  tax: number
  shipping_cost: number
  discount_amount: number
  stripe_payment_intent_id?: string
  billing_address_id: string
  shipping_address_id: string
  shipping_method: string
  tracking_number?: string
  notes?: string
  created_at: string
  updated_at: string
  receipt_url?: string
  payment_method_details?: any
  dispute_status?: string
  dispute_reason?: string
  dispute_evidence?: any
  dispute_created_at?: string
  dispute_resolved_at?: string
  fraud_warning?: boolean
  fraud_warning_details?: any
  // Relations
  billing_address?: Address
  shipping_address?: Address
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
  // Relations
  products?: any // This will be the product with images
}

export type OrderStatus = 
  | 'pending'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'
  | 'partially_refunded'
  | 'payment_failed'
  | 'disputed'
  | 'chargeback'
  | 'flagged_for_review'


export interface OrdersResponse {
    data: Order[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      total_pages: number;
    };
  }