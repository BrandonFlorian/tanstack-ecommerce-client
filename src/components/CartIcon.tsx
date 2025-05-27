import React, { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCartSummary } from '@/hooks/useCart'

interface CartIconProps {
  className?: string
}

export function CartIcon({ className }: CartIconProps) {
  const { itemCount, isReady } = useCartSummary()
  const [isClient, setIsClient] = useState(false)

  // Ensure we only show the badge on client side to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true)
  }, [])

  return (
    <Link to="/cart" className={className}>
      <Button variant="ghost" size="icon" className="relative">
        <ShoppingCart className="h-5 w-5" />
        {isClient && isReady && itemCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {itemCount > 99 ? '99+' : itemCount}
          </Badge>
        )}
      </Button>
    </Link>
  )
}