import { createFileRoute } from '@tanstack/react-router'
import { Categories } from '@/components/Categories'

export const Route = createFileRoute('/categories')({
  component: CategoriesPage,
})

function CategoriesPage() {
  return <Categories />
}