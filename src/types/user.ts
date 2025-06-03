export interface Address {
    id: string
    user_id: string
    name: string
    address_line1: string
    address_line2?: string | null
    city: string
    state: string
    postal_code: string
    country: string
    is_default: boolean
    created_at: string
    updated_at: string
  }
