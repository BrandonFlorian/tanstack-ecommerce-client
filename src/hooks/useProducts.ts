import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query'
import { useSession } from '@/hooks/useSession'
import { 
  fetchProducts, 
  fetchProduct, 
  fetchProductsByCategory,
  createProduct,
  updateProduct,
  deleteProduct
} from '@/utils/productApi'
import type { Product, ProductsResponse, ProductFilters } from '@/types/product'

// Product queries
export function useProducts(
  filters?: ProductFilters,
  options?: Partial<UseQueryOptions<ProductsResponse, Error>>
) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => fetchProducts({ data: filters }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  })
}

export function useProduct(
  productId: string | undefined,
  options?: Partial<UseQueryOptions<Product, Error>>
) {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: () => fetchProduct({ data: productId! }),
    enabled: !!productId,
    staleTime: 1000 * 60 * 10, // 10 minutes
    ...options,
  })
}

export function useProductsByCategory(
  categoryId: string | undefined,
  filters?: ProductFilters,
  options?: Partial<UseQueryOptions<ProductsResponse, Error>>
) {
  return useQuery({
    queryKey: ['products', 'category', categoryId, filters],
    queryFn: () => fetchProductsByCategory({ data: { categoryId: categoryId!, filters } }),
    enabled: !!categoryId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  })
}

// Product mutations (admin only)
export function useCreateProduct() {
  const queryClient = useQueryClient()
  const { session } = useSession()

  return useMutation({
    mutationFn: (data: Partial<Product>) => createProduct({ data }),
    onSuccess: () => {
      // Invalidate all product queries
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
    meta: {
      requiresAuth: true,
      requiresRole: 'admin'
    }
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()
  const { session } = useSession()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Product> }) => 
      updateProduct({ data: { id, updates } }),
    onSuccess: (updatedProduct, { id }) => {
      // Update the specific product in cache
      queryClient.setQueryData(['product', id], updatedProduct)
      // Invalidate product lists
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
    meta: {
      requiresAuth: true,
      requiresRole: 'admin'
    }
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  const { session } = useSession()

  return useMutation({
    mutationFn: (productId: string) => deleteProduct({ data: productId }),
    onSuccess: (_, productId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: ['product', productId] })
      // Invalidate product lists
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
    meta: {
      requiresAuth: true,
      requiresRole: 'admin'
    }
  })
}