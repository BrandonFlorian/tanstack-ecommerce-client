import React from 'react'
import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { useCategory } from '@/hooks/useCategories'
import { useProductsByCategory } from '@/hooks/useProducts'
import { ProductGrid } from '@/components/ProductGrid'
import { CategoryNav } from '@/components/CategoryNav'
import { ArrowLeft } from 'lucide-react'
import { fetchCategory } from '@/utils/productApi'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/categories/$categoryId')({
  loader: async ({ params }) => {
    try {
      const category = await fetchCategory({ data: params.categoryId })
      return { category }
    } catch (error) {
      throw notFound()
    }
  },
  component: CategoryPage,
})

function CategoryPage() {
  const { categoryId } = Route.useParams()
  const loaderData = Route.useLoaderData()
  
  const { data: category } = useCategory(categoryId, {
    initialData: loaderData.category,
  })
  
  const { data: productsResponse, isLoading } = useProductsByCategory(
    categoryId,
    { page: 1, limit: 20 }
  )

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-destructive mb-4">Category Not Found</h1>
        <Link to="/products">
          <Button>Back to Products</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-64">
          <CategoryNav currentCategoryId={categoryId} />
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="mb-6">
            <Link to="/products" className="text-muted-foreground hover:text-foreground flex items-center mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              All Products
            </Link>
            
            <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
            {category.description && (
              <p className="text-muted-foreground">{category.description}</p>
            )}
            {productsResponse && (
              <p className="text-sm text-muted-foreground mt-2">
                {productsResponse.data.length} products in this category
              </p>
            )}
          </div>

          <ProductGrid 
            products={productsResponse?.data || []}
            loading={isLoading}
          />
        </div>
      </div>
    </div>
  )
}