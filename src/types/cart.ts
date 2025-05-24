export interface CartItem {
    id: string
    quantity: number
    created_at: string
    updated_at: string
    products: {
      id: string
      name: string
      price: number
      compare_at_price?: number
      sku: string
      weight: number
      dimensions: {
        length: number
        width: number
        height: number
      }
      inventory_quantity: number
      product_images: Array<{
        url: string
        alt_text: string
        is_primary: boolean
      }>
    }
  }
  
  export interface Cart {
    id: string
    user_id?: string
    session_id?: string
    created_at: string
    updated_at: string
  }
  
  export interface CartSummary {
    subtotal: number
    totalItems: number
  }
  
  export interface CartWithItems {
    cart: Cart | null
    items: CartItem[]
    summary: CartSummary
  }
  
  export interface AddToCartRequest {
    product_id: string
    quantity: number
    sessionId?: string
  }
  
  export interface UpdateCartItemRequest {
    quantity: number
  }