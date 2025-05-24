import React from 'react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useProducts } from '@/hooks/useProducts'
import { useCategories } from '@/hooks/useCategories'
import { ProductGrid } from '@/components/ProductGrid'
import { ProductFilters } from '@/components/ProductFilters'
import { CategoryNav } from '@/components/CategoryNav'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { ProductFilters as ProductFiltersType } from '@/types/product'

// Route search schema for filters
type ProductsSearch = {
  page?: number
  limit?: number
  query?: string
  category?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  sortBy?: 'created_at' | 'name' | 'price'
  sortOrder?: 'asc' | 'desc'
}

export const Route = createFileRoute('/products/')({
  validateSearch: (search: Record<string, unknown>): ProductsSearch => ({
    page: Number(search?.page) || 1,
    limit: Number(search?.limit) || 12,
    query: search?.query as string,
    category: search?.category as string,
    minPrice: search?.minPrice ? Number(search.minPrice) : undefined,
    maxPrice: search?.maxPrice ? Number(search.maxPrice) : undefined,
    inStock: search?.inStock === 'true',
    sortBy: (search?.sortBy as ProductsSearch['sortBy']) || 'created_at',
    sortOrder: (search?.sortOrder as ProductsSearch['sortOrder']) || 'desc',
  }),
  component: ProductsPage,
})

function ProductsPage() {
  const router = useRouter()
  const search = Route.useSearch()
  
  const filters: ProductFiltersType = {
    page: search.page,
    limit: search.limit,
    query: search.query,
    category_id: search.category,
    min_price: search.minPrice,
    max_price: search.maxPrice,
    in_stock: search.inStock,
    sort_by: search.sortBy,
    sort_order: search.sortOrder,
  }

  const { data: productsResponse, isLoading, error } = useProducts(filters)
  const { data: categories } = useCategories()

  const handleFiltersChange = (newFilters: ProductFiltersType) => {
    router.navigate({
      to: '/products',
      search: {
        page: newFilters.page || 1,
        limit: newFilters.limit || 12,
        query: newFilters.query || undefined,
        category: newFilters.category_id || undefined,
        minPrice: newFilters.min_price || undefined,
        maxPrice: newFilters.max_price || undefined,
        inStock: newFilters.in_stock || undefined,
        sortBy: newFilters.sort_by || 'created_at',
        sortOrder: newFilters.sort_order || 'desc',
      },
    })
  }

  const handlePageChange = (page: number) => {
    router.navigate({
      to: '/products',
      search: {
        ...search,
        page,
      },
    })
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Error Loading Products</h1>
          <p className="text-muted-foreground">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-64 space-y-6">
          <CategoryNav currentCategoryId={search.category} />
          <ProductFilters 
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Products</h1>
            {productsResponse && (
              <p className="text-muted-foreground">
                Showing {productsResponse.data.length} of {productsResponse.pagination.total} products
              </p>
            )}
          </div>

          <ProductGrid 
            products={productsResponse?.data || []}
            loading={isLoading}
            className="mb-8"
          />

          {/* Pagination */}
          {productsResponse && productsResponse.pagination.total_pages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(search.page! - 1)}
                disabled={search.page === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              <span className="text-sm text-muted-foreground mx-4">
                Page {search.page} of {productsResponse.pagination.total_pages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(search.page! + 1)}
                disabled={search.page === productsResponse.pagination.total_pages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}