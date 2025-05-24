import React from 'react'
import { useForm } from '@tanstack/react-form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import type { ProductFilters } from '@/types/product'

interface ProductFiltersProps {
  filters: ProductFilters
  onFiltersChange: (filters: ProductFilters) => void
  className?: string
}

export function ProductFilters({ filters, onFiltersChange, className }: ProductFiltersProps) {
  const form = useForm({
    defaultValues: {
      query: filters.query || '',
      min_price: filters.min_price?.toString() || '',
      max_price: filters.max_price?.toString() || '',
      in_stock: filters.in_stock ?? true,
      sort_by: filters.sort_by || 'created_at',
      sort_order: filters.sort_order || 'desc'
    },
    onSubmit: ({ value }) => {
      const newFilters: ProductFilters = {
        ...filters,
        query: value.query || undefined,
        min_price: value.min_price ? parseFloat(value.min_price) : undefined,
        max_price: value.max_price ? parseFloat(value.max_price) : undefined,
        in_stock: value.in_stock,
        sort_by: value.sort_by as ProductFilters['sort_by'],
        sort_order: value.sort_order as ProductFilters['sort_order'],
        page: 1 // Reset to first page when filters change
      }
      onFiltersChange(newFilters)
    }
  })

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit} className="space-y-4">
          <form.Field name="query">
            {(field) => (
              <div>
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  placeholder="Search products..."
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          </form.Field>

          <div className="grid grid-cols-2 gap-4">
            <form.Field name="min_price">
              {(field) => (
                <div>
                  <Label htmlFor="min_price">Min Price</Label>
                  <Input
                    id="min_price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="max_price">
              {(field) => (
                <div>
                  <Label htmlFor="max_price">Max Price</Label>
                  <Input
                    id="max_price"
                    type="number"
                    step="0.01"
                    placeholder="999.99"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>
          </div>

          <form.Field name="in_stock">
            {(field) => (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="in_stock"
                  checked={field.state.value}
                  onCheckedChange={(checked) => field.handleChange(checked === true)}
                />
                <Label htmlFor="in_stock">In stock only</Label>
              </div>
            )}
          </form.Field>

          <div className="grid grid-cols-2 gap-4">
            <form.Field name="sort_by">
              {(field) => (
                <div>
                  <Label>Sort by</Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => field.handleChange(value as typeof field.state.value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="created_at">Date Added</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="price">Price</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>

            <form.Field name="sort_order">
              {(field) => (
                <div>
                  <Label>Order</Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => field.handleChange(value as typeof field.state.value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Ascending</SelectItem>
                      <SelectItem value="desc">Descending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>
          </div>

          <Button type="submit" className="w-full">
            Apply Filters
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}