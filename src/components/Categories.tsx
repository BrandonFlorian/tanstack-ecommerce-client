import React from 'react'
import { Link } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Folder, Package } from 'lucide-react'
import { useCategoryTree } from '@/hooks/useCategories'
import { Skeleton } from '@/components/ui/skeleton'
import type { CategoryWithChildren } from '@/hooks/useCategories'

export function Categories() {
  const { data: categoryTree, isLoading, error } = useCategoryTree()

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Error Loading Categories</h1>
          <p className="text-muted-foreground">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <Badge variant="secondary" className="mb-4">
          📁 Browse Categories
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Shop by Category
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Explore our wide range of product categories to find exactly what you're looking for.
        </p>
      </div>

      {/* Categories Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryTree.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && categoryTree.length === 0 && (
        <div className="text-center py-16">
          <Folder className="h-24 w-24 text-muted-foreground mx-auto mb-6 opacity-50" />
          <h2 className="text-2xl font-semibold mb-4">No Categories Found</h2>
          <p className="text-muted-foreground mb-6">
            Categories will appear here once they're added to the store.
          </p>
          <Link to="/products">
            <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors">
              Browse All Products
            </button>
          </Link>
        </div>
      )}

      {/* Call to Action */}
      {!isLoading && categoryTree.length > 0 && (
        <div className="mt-16 text-center bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4">
            Can't find what you're looking for?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Browse all our products or use the search function to find specific items.
          </p>
          <Link to="/products">
            <button className="bg-primary text-primary-foreground px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors inline-flex items-center">
              View All Products
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </Link>
        </div>
      )}
    </div>
  )
}

function CategoryCard({ category }: { category: CategoryWithChildren }) {
  const hasSubcategories = category.children.length > 0

  return (
    <Link 
      to="/categories/$categoryId" 
      params={{ categoryId: category.id }}
      className="group block"
    >
      <Card className="h-full hover:shadow-lg transition-all duration-300 group-hover:scale-[1.02] border-2 hover:border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="group-hover:text-primary transition-colors flex items-center gap-2">
                <Folder className="h-5 w-5" />
                {category.name}
              </CardTitle>
              {category.description && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  {category.description}
                </p>
              )}
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {hasSubcategories ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Package className="h-4 w-4" />
                <span>{category.children.length} subcategories</span>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Includes:</p>
                <div className="flex flex-wrap gap-1">
                  {category.children.slice(0, 3).map((child) => (
                    <Badge 
                      key={child.id} 
                      variant="secondary" 
                      className="text-xs group-hover:bg-primary/10"
                    >
                      {child.name}
                    </Badge>
                  ))}
                  {category.children.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{category.children.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Package className="h-4 w-4" />
              <span>Browse products</span>
            </div>
          )}
          
          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">View category</span>
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <ArrowRight className="h-3 w-3 text-primary" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}