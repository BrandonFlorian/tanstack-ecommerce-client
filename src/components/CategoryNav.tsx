import React from 'react'
import { Link } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { useCategoryTree, type CategoryWithChildren } from '@/hooks/useCategories'
import { Skeleton } from '@/components/ui/skeleton'

interface CategoryNavProps {
  currentCategoryId?: string
  className?: string
}

export function CategoryNav({ currentCategoryId, className }: CategoryNavProps) {
  const { data: categoryTree, isLoading } = useCategoryTree()

  if (isLoading) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    )
  }

  const CategoryItem = ({ category, depth = 0 }: { category: CategoryWithChildren, depth?: number }) => {
    const isActive = currentCategoryId === category.id
    
    return (
      <div>
        <Link
          to="/categories/$categoryId"
          params={{ categoryId: category.id }}
          className={`
            flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors
            ${isActive 
              ? 'bg-primary text-primary-foreground' 
              : 'hover:bg-accent hover:text-accent-foreground'
            }
          `}
          style={{ paddingLeft: `${12 + depth * 16}px` }}
        >
          <span>{category.name}</span>
          {category.children.length > 0 && (
            <ChevronRight className="h-4 w-4" />
          )}
        </Link>
        
        {category.children.length > 0 && (
          <div className="mt-1">
            {category.children.map((child) => (
              <CategoryItem 
                key={child.id} 
                category={child}
                depth={depth + 1} 
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <nav className={className}>
      <div className="space-y-1">
        <Link
          to="/products"
          className={`
            flex items-center px-3 py-2 rounded-lg text-sm transition-colors
            ${!currentCategoryId 
              ? 'bg-primary text-primary-foreground' 
              : 'hover:bg-accent hover:text-accent-foreground'
            }
          `}
        >
          All Products
        </Link>
        
        {categoryTree.map((category) => (
          <CategoryItem key={category.id} category={category} />
        ))}
      </div>
    </nav>
  )
}