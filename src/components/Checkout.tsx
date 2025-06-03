import { Elements } from "@stripe/react-stripe-js"
import { CartSummary } from "./CartSummary"
import { CardContent, CardHeader, CardTitle } from "./ui/card"
import { Card } from "./ui/card"
import { Button } from "./ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import { ShippingMethodSelector } from "./ShippingMethodSelector"
import { AddressSelector } from "./AddressSelector"
import { Skeleton } from "./ui/skeleton"
import { useEffect, useState } from "react"
import { useCart } from "@/hooks/useCart"
import { createPaymentIntent } from "@/utils/paymentApi"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useCartSummary } from "@/hooks/useCart"
import { useNavigate } from "@tanstack/react-router"
import { useAddresses } from "@/hooks/useAddresses"
import { CheckoutForm } from "./CheckoutForm"
import { loadStripe } from "@stripe/stripe-js"
import { AlertDescription } from "./ui/alert"
import { Alert } from "./ui/alert"
import { calculateShippingRates } from "@/utils/shippingApi"
import React from "react"

export function Checkout() {
  const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!)

  const navigate = useNavigate()
  const { data: cart, isLoading: cartLoading } = useCart()
  const { isEmpty } = useCartSummary()
  const { data: addresses, isLoading: addressesLoading } = useAddresses()
  
  const [step, setStep] = useState<'addresses' | 'shipping' | 'payment'>('addresses')
  const [shippingAddressId, setShippingAddressId] = useState<string>()
  const [billingAddressId, setBillingAddressId] = useState<string>()
  const [sameAsShipping, setSameAsShipping] = useState(true)
  const [shippingMethod, setShippingMethod] = useState<string>()
  const [selectedShippingRate, setSelectedShippingRate] = useState<any>()
  const [paymentIntent, setPaymentIntent] = useState<any>()
  
  const createPaymentIntentMutation = useMutation({
    mutationFn: createPaymentIntent,
    onSuccess: (data) => {
      setPaymentIntent(data)
      setStep('payment')
    }
  })

  // Fetch real shipping rates based on selected address
  const { data: shippingRates, isLoading: shippingRatesLoading } = useQuery({
    queryKey: ['shipping-rates', shippingAddressId, cart?.cart?.id],
    queryFn: () => calculateShippingRates({ 
      data: { 
        address_id: shippingAddressId!, 
        cart_id: cart?.cart?.id! 
      } 
    }),
    enabled: !!shippingAddressId && !!cart?.cart?.id && step === 'shipping',
  })
  
  // Format shipping methods for display
  const shippingMethods = React.useMemo(() => {
    if (!shippingRates) return []
    return shippingRates.map(rate => ({
      ...rate,
      estimated_days: `${rate.estimated_days} ${rate.estimated_days === 1 ? 'day' : 'days'}`
    }))
  }, [shippingRates])

  useEffect(() => {
    if (isEmpty && !cartLoading) {
      navigate({ to: '/cart' })
    }
  }, [isEmpty, cartLoading, navigate])

  useEffect(() => {
    // Set default addresses if available
    if (addresses && addresses.length > 0) {
      const defaultAddress = addresses.find(a => a.is_default) || addresses[0]
      if (defaultAddress && !shippingAddressId) {
        setShippingAddressId(defaultAddress.id)
        if (sameAsShipping) {
          setBillingAddressId(defaultAddress.id)
        }
      }
    }
  }, [addresses, sameAsShipping, shippingAddressId])

  const handleSelectShippingMethod = (method: string) => {
    setShippingMethod(method)
    // Find the full rate object
    const rate = shippingRates?.find(r => r.service_code === method)
    setSelectedShippingRate(rate)
  }

  const handleProceedToShipping = () => {
    if (!shippingAddressId || !billingAddressId) {
      return
    }
    setStep('shipping')
  }

  const handleProceedToPayment = () => {
    if (!shippingMethod || !cart || !selectedShippingRate) {
      return
    }

    createPaymentIntentMutation.mutate({
      data: {
        cart_id: cart.cart?.id!,
        shipping_address_id: shippingAddressId!,
        billing_address_id: billingAddressId!,
        shipping_method: shippingMethod,
        shipping_rate_id: selectedShippingRate.rate_id, // Pass Shippo rate ID
      }
    })
  }

  const handlePaymentSuccess = (paymentIntentId: string) => {
    navigate({ 
      to: '/order-confirmation',
      search: { payment_intent: paymentIntentId }
    })
  }

  if (cartLoading || addressesLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-64 w-full" />
            </div>
            <div>
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate({ to: '/cart' })}
            className="flex items-center text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cart
          </button>
          
          <div className="flex items-center gap-4">
            <div className={`flex items-center ${step === 'addresses' ? 'text-primary' : 'text-muted-foreground'}`}>
              <span className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium">
                1
              </span>
              <span className="ml-2 hidden sm:inline">Addresses</span>
            </div>
            <div className="w-12 h-0.5 bg-border" />
            <div className={`flex items-center ${step === 'shipping' ? 'text-primary' : 'text-muted-foreground'}`}>
              <span className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium">
                2
              </span>
              <span className="ml-2 hidden sm:inline">Shipping</span>
            </div>
            <div className="w-12 h-0.5 bg-border" />
            <div className={`flex items-center ${step === 'payment' ? 'text-primary' : 'text-muted-foreground'}`}>
              <span className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium">
                3
              </span>
              <span className="ml-2 hidden sm:inline">Payment</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  {step === 'addresses' && 'Select Addresses'}
                  {step === 'shipping' && 'Choose Shipping Method'}
                  {step === 'payment' && 'Payment Information'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {step === 'addresses' && addresses && (
                  <div className="space-y-6">
                    <AddressSelector
                      addresses={addresses}
                      selectedId={shippingAddressId}
                      onSelect={setShippingAddressId}
                      onAddNew={() => {
                        // TODO: Show address form modal
                        console.log('Add new address')
                      }}
                      label="Shipping Address"
                    />
                    
                    <div className="space-y-3">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={sameAsShipping}
                          onChange={(e) => {
                            setSameAsShipping(e.target.checked)
                            if (e.target.checked) {
                              setBillingAddressId(shippingAddressId)
                            }
                          }}
                          className="rounded"
                        />
                        <span>Billing address same as shipping</span>
                      </label>
                      
                      {!sameAsShipping && (
                        <AddressSelector
                          addresses={addresses}
                          selectedId={billingAddressId}
                          onSelect={setBillingAddressId}
                          onAddNew={() => {
                            // TODO: Show address form modal
                            console.log('Add new address')
                          }}
                          label="Billing Address"
                        />
                      )}
                    </div>
                    
                    <Button 
                      onClick={handleProceedToShipping}
                      disabled={!shippingAddressId || !billingAddressId}
                      className="w-full"
                      size="lg"
                    >
                      Continue to Shipping
                    </Button>
                  </div>
                )}
                
                {step === 'shipping' && (
                  <div className="space-y-6">
                    {shippingRatesLoading ? (
                      <div className="space-y-3">
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                      </div>
                    ) : shippingMethods.length === 0 ? (
                      <Alert variant="destructive">
                        <AlertDescription>
                          No shipping options available for this address.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <ShippingMethodSelector
                        methods={shippingMethods}
                        selectedMethod={shippingMethod}
                        onSelect={handleSelectShippingMethod}
                      />
                    )}
                    
                    <div className="flex gap-4">
                      <Button 
                        variant="outline"
                        onClick={() => setStep('addresses')}
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button 
                        onClick={handleProceedToPayment}
                        disabled={!shippingMethod || createPaymentIntentMutation.isPending || shippingMethods.length === 0}
                        className="flex-1"
                      >
                        {createPaymentIntentMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          'Continue to Payment'
                        )}
                      </Button>
                    </div>
                  </div>
                )}
                
                {step === 'payment' && paymentIntent && (
                  <Elements 
                    stripe={stripePromise}
                    options={{
                      clientSecret: paymentIntent.clientSecret,
                      appearance: {
                        theme: 'stripe',
                        variables: {
                          colorPrimary: '#0070f3',
                        },
                      },
                    }}
                  >
                    <CheckoutForm 
                      clientSecret={paymentIntent.clientSecret}
                      onSuccess={handlePaymentSuccess}
                    />
                  </Elements>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order summary sidebar */}
          <div>
            <CartSummary 
              onCheckout={() => {}} 
              className="sticky top-4"
            />
            
            {paymentIntent && (
              <Card className="mt-4">
                <CardContent className="p-4">
                  <h3 className="font-medium mb-2">Order Total Breakdown</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${(paymentIntent.subtotal / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>${(paymentIntent.shipping / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>${(paymentIntent.tax / 100).toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-1 font-semibold flex justify-between">
                      <span>Total</span>
                      <span>${(paymentIntent.amount / 100).toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}