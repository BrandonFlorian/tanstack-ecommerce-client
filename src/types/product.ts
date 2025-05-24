// src/types/product.ts
export interface Category {
    id: string
    name: string
    slug: string
    description?: string
    parent_id?: string
    created_at: string
    updated_at: string
  }
  
  export interface ProductImage {
    id: string
    product_id: string
    url: string
    alt_text: string
    position: number
    is_primary: boolean
    created_at: string
  }
  
  export interface Product {
    id: string
    name: string
    description: string
    price: number
    compare_at_price?: number
    cost_price: number
    sku: string
    barcode?: string
    weight: number
    dimensions: {
      length: number
      width: number
      height: number
    }
    inventory_quantity: number
    is_active: boolean
    category_id: string
    created_at: string
    updated_at: string
    // Relations
    category?: Category
    product_images?: ProductImage[]
  }
  
  export interface ProductsResponse {
    data: Product[]
    pagination: {
      page: number
      limit: number
      total: number
      total_pages: number
    }
  }
  
  export interface ProductFilters {
    page?: number
    limit?: number
    sort_by?: 'created_at' | 'name' | 'price'
    sort_order?: 'asc' | 'desc'
    query?: string
    category_id?: string
    min_price?: number
    max_price?: number
    in_stock?: boolean
  }
  