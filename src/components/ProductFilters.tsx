import React, { useEffect, useState } from 'react'
import { useDebounce } from '@/hooks/useDebounce' // You'll need to create this hook
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider' // You'll need to install this from shadcn
import type { ProductFilters } from '@/types/product'

interface ProductFiltersProps {
  filters: ProductFilters
  onFiltersChange: (filters: ProductFilters) => void
  className?: string
}

export function ProductFilters({ filters, onFiltersChange, className }: ProductFiltersProps) {
  const [localFilters, setLocalFilters] = useState(filters)
  const [searchQuery, setSearchQuery] = useState(filters.query || '')
  const debouncedSearch = useDebounce(searchQuery, 500)

  // Update filters when debounced search changes
  useEffect(() => {
    if (debouncedSearch !== filters.query) {
      onFiltersChange({
        ...localFilters,
        query: debouncedSearch || undefined,
        page: 1
      })
    }
  }, [debouncedSearch])

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters)
    setSearchQuery(filters.query || '')
  }, [filters])

  const handleFilterChange = (key: keyof ProductFilters, value: any) => {
    const newFilters = {
      ...localFilters,
      [key]: value,
      page: 1 // Reset to first page on filter change
    }
    setLocalFilters(newFilters)
    
    // For non-search fields, update immediately
    if (key !== 'query') {
      onFiltersChange(newFilters)
    }
  }

  const handleReset = () => {
    const resetFilters: ProductFilters = {
      page: 1,
      limit: 12,
      sort_by: 'created_at',
      sort_order: 'desc',
      in_stock: true
    }
    setLocalFilters(resetFilters)
    setSearchQuery('')
    onFiltersChange(resetFilters)
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Filters</CardTitle>
          <Button variant="ghost" size="sm" onClick={handleReset}>
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div>
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Price Range */}
        <div className="space-y-2">
          <Label>Price Range</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              step="0.01"
              placeholder="Min"
              value={localFilters.min_price || ''}
              onChange={(e) => handleFilterChange('min_price', e.target.value ? parseFloat(e.target.value) : undefined)}
            />
            <Input
              type="number"
              step="0.01"
              placeholder="Max"
              value={localFilters.max_price || ''}
              onChange={(e) => handleFilterChange('max_price', e.target.value ? parseFloat(e.target.value) : undefined)}
            />
          </div>
        </div>

        {/* In Stock */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="in_stock"
            checked={localFilters.in_stock ?? true}
            onCheckedChange={(checked) => handleFilterChange('in_stock', checked)}
          />
          <Label htmlFor="in_stock" className="cursor-pointer">
            In stock only
          </Label>
        </div>

        {/* Sort */}
        <div className="space-y-2">
          <Label>Sort by</Label>
          <Select
            value={`${localFilters.sort_by}-${localFilters.sort_order}`}
            onValueChange={(value) => {
              const [sortBy, sortOrder] = value.split('-')
              handleFilterChange('sort_by', sortBy)
              handleFilterChange('sort_order', sortOrder)
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at-desc">Newest First</SelectItem>
              <SelectItem value="created_at-asc">Oldest First</SelectItem>
              <SelectItem value="name-asc">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              <SelectItem value="price-asc">Price (Low to High)</SelectItem>
              <SelectItem value="price-desc">Price (High to Low)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}