import { createFileRoute } from '@tanstack/react-router'
import { Homepage } from '@/components/Home'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return <Homepage />
}