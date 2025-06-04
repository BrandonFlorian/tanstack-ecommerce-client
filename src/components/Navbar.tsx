import { Link } from '@tanstack/react-router'
import { Home, ShoppingBag, Package, User, Menu } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { CartIcon } from '@/components/CartIcon'
import { LogoutButton } from '@/components/LogoutButton'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface NavbarProps {
  user?: { email: string } | null
}

export function Navbar({ user }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  const navItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/products', label: 'Products', icon: ShoppingBag },
    { to: '/orders', label: 'Orders', icon: Package },
  ]
  
  return (
    <>
      {/* Desktop Navbar */}
      <nav className="hidden md:flex items-center justify-between p-4 border-b bg-background">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-xl font-bold">
            Store
          </Link>
          
          <div className="flex gap-4">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeProps={{ className: 'text-primary font-semibold' }}
                activeOptions={{ exact: item.to === '/' }}
                className="hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <CartIcon />
          
          {user ? (
            <>
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <Link 
                to="/profile"
                activeProps={{ className: 'text-primary font-semibold' }}
                className="hover:text-primary transition-colors"
              >
                Profile
              </Link>
              <LogoutButton />
            </>
          ) : (
            <Link to="/login">
              <Button variant="outline" size="sm">
                Login
              </Button>
            </Link>
          )}
        </div>
      </nav>
      
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 border-b bg-background">
        <Link to="/" className="text-xl font-bold">
          Store
        </Link>
        
        <div className="flex items-center gap-2">
          <CartIcon />
          
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col gap-4 mt-8">
                {user ? (
                  <>
                    <div className="pb-4 border-b">
                      <p className="text-sm text-muted-foreground">Signed in as</p>
                      <p className="font-medium">{user.email}</p>
                    </div>
                    <Link 
                      to="/profile"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 py-2"
                    >
                      <User className="h-5 w-5" />
                      Profile
                    </Link>
                    <div className="pt-4 border-t">
                      <LogoutButton />
                    </div>
                  </>
                ) : (
                  <Link to="/login" onClick={() => setIsOpen(false)}>
                    <Button className="w-full">Login</Button>
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t z-50">
        <div className="grid grid-cols-4 gap-1 p-2">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.to}
                to={item.to}
                activeProps={{ className: 'text-primary' }}
                activeOptions={{ exact: item.to === '/' }}
                className={cn(
                  "flex flex-col items-center justify-center py-2 px-1 rounded-lg",
                  "hover:bg-accent transition-colors",
                  "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-xs">{item.label}</span>
              </Link>
            )
          })}
          
          <Link
            to={user ? '/profile' : '/login'}
            activeProps={{ className: 'text-primary' }}
            className={cn(
              "flex flex-col items-center justify-center py-2 px-1 rounded-lg",
              "hover:bg-accent transition-colors",
              "text-muted-foreground hover:text-foreground"
            )}
          >
            <User className="h-5 w-5 mb-1" />
            <span className="text-xs">{user ? 'Profile' : 'Login'}</span>
          </Link>
        </div>
      </nav>
      
      {/* Spacer for bottom nav on mobile */}
      <div className="md:hidden h-16" />
    </>
  )
}