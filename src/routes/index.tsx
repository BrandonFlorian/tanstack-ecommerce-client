import { createFileRoute } from '@tanstack/react-router'
import { Homepage } from '@/components/Home'
import ThemeDemo from '@/components/ThemeDemo'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() { 
  return <ThemeDemo />
}