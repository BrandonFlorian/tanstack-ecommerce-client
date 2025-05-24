import React from 'react'
import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { fetchCategories, fetchCategory } from '@/utils/productApi'
import type { Category } from '@/types/product'

// Define a proper recursive type for categories with children
export type CategoryWithChildren = Category & {
  children: CategoryWithChildren[]
}

export function useCategories(
  options?: Partial<UseQueryOptions<Category[], Error>>
) {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => fetchCategories(),
    staleTime: 1000 * 60 * 15, // 15 minutes (categories don't change often)
    ...options,
  })
}

export function useCategory(
  categoryId: string | undefined,
  options?: Partial<UseQueryOptions<Category, Error>>
) {
  return useQuery({
    queryKey: ['category', categoryId],
    queryFn: () => fetchCategory({ data: categoryId! }),
    enabled: !!categoryId,
    staleTime: 1000 * 60 * 15, // 15 minutes
    ...options,
  })
}

// Utility hooks for organized data
export function useCategoryTree() {
  const { data: categories, ...rest } = useCategories()
  
  const categoryTree = React.useMemo(() => {
    if (!categories) return []
    
    // Build a tree structure from flat category list
    const categoryMap = new Map<string, CategoryWithChildren>(
      categories.map(cat => [cat.id, { ...cat, children: [] }])
    )
    const rootCategories: CategoryWithChildren[] = []
    
    categories.forEach(category => {
      const categoryNode = categoryMap.get(category.id)!
      if (category.parent_id && categoryMap.has(category.parent_id)) {
        categoryMap.get(category.parent_id)!.children.push(categoryNode)
      } else {
        rootCategories.push(categoryNode)
      }
    })
    
    return rootCategories
  }, [categories])
  
  return {
    data: categoryTree,
    flatCategories: categories,
    ...rest
  }
}