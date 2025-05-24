import { createServerFn } from '@tanstack/react-start'
import { ApiServerClient } from '@/lib/apiServerClient'
import { getSupabaseServerClient } from '@/utils/supabase'
import { EXPRESS_SERVER_URL_WITH_PORT } from '@/config/constants'
import type { Category, Product, ProductsResponse, ProductFilters } from '@/types/product'

// Categories
export const fetchCategories = createServerFn({ method: 'GET' }).handler(async () => {
  const api = new ApiServerClient(EXPRESS_SERVER_URL_WITH_PORT)
  const response = await api.get<{ data: Category[], status: string }>('/api/products/categories')
  return response.data
})

export const fetchCategory = createServerFn({ method: 'GET' })
  .validator((categoryId: string) => categoryId)
  .handler(async ({ data: categoryId }) => {
    const api = new ApiServerClient(EXPRESS_SERVER_URL_WITH_PORT)
    const response = await api.get<{ data: Category, status: string }>(`/api/products/categories/${categoryId}`)
    return response.data
  })

// Products
export const fetchProducts = createServerFn({ method: 'GET' })
  .validator((filters?: ProductFilters) => filters || {})
  .handler(async ({ data: filters }) => {
    const api = new ApiServerClient(EXPRESS_SERVER_URL_WITH_PORT)
    const params = new URLSearchParams()
    
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())
    if (filters.sort_by) params.append('sort_by', filters.sort_by)
    if (filters.sort_order) params.append('sort_order', filters.sort_order)
    if (filters.query) params.append('query', filters.query)
    if (filters.category_id) params.append('category_id', filters.category_id)
    if (filters.min_price) params.append('min_price', filters.min_price.toString())
    if (filters.max_price) params.append('max_price', filters.max_price.toString())
    if (filters.in_stock !== undefined) params.append('in_stock', filters.in_stock.toString())

    const queryString = params.toString()
    const url = `/api/products${queryString ? `?${queryString}` : ''}`
    
    const response = await api.get<ProductsResponse>(url)
    return response
  })

export const fetchProduct = createServerFn({ method: 'GET' })
  .validator((productId: string) => productId)
  .handler(async ({ data: productId }) => {
    const api = new ApiServerClient(EXPRESS_SERVER_URL_WITH_PORT)
    const response = await api.get<{ data: Product, status: string }>(`/api/products/${productId}`)
    return response.data
  })

export const fetchProductsByCategory = createServerFn({ method: 'GET' })
  .validator((data: { categoryId: string; filters?: ProductFilters }) => data)
  .handler(async ({ data: { categoryId, filters } }) => {
    const api = new ApiServerClient(EXPRESS_SERVER_URL_WITH_PORT)
    const params = new URLSearchParams()
    
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())
    if (filters?.sort_by) params.append('sort_by', filters.sort_by)
    if (filters?.sort_order) params.append('sort_order', filters.sort_order)

    const queryString = params.toString()
    const url = `/api/products/categories/${categoryId}/products${queryString ? `?${queryString}` : ''}`
    
    const response = await api.get<ProductsResponse>(url)
    return response
  })

// Admin functions (require authentication)
export const createProduct = createServerFn({ method: 'POST' })
  .validator((data: Partial<Product>) => data)
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error || !session) {
      throw new Error('Not authenticated')
    }

    const api = new ApiServerClient(EXPRESS_SERVER_URL_WITH_PORT, session.access_token)
    const response = await api.post<{ data: Product, status: string }>('/api/products', data)
    return response.data
  })

export const updateProduct = createServerFn({ method: 'POST' })
  .validator((data: { id: string; updates: Partial<Product> }) => data)
  .handler(async ({ data: { id, updates } }) => {
    const supabase = getSupabaseServerClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error || !session) {
      throw new Error('Not authenticated')
    }

    const api = new ApiServerClient(EXPRESS_SERVER_URL_WITH_PORT, session.access_token)
    const response = await api.put<{ data: Product, status: string }>(`/api/products/${id}`, updates)
    return response.data
  })

export const deleteProduct = createServerFn({ method: 'POST' })
  .validator((productId: string) => productId)
  .handler(async ({ data: productId }) => {
    const supabase = getSupabaseServerClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error || !session) {
      throw new Error('Not authenticated')
    }

    const api = new ApiServerClient(EXPRESS_SERVER_URL_WITH_PORT, session.access_token)
    await api.delete(`/api/products/${productId}`)
    return { success: true }
  })