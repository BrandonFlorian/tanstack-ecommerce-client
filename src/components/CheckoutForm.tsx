import { CreditCard } from "lucide-react"
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js'
import { useState } from "react"
import { Button } from "./ui/button"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "./ui/alert"

export function CheckoutForm({ 
  clientSecret,
  onSuccess 
}: { 
  clientSecret: string
  onSuccess: (paymentIntentId: string) => void 
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  const handleSubmit = async () => {
    if (!stripe || !elements) return

    setProcessing(true)
    setError(null)

    try {
      const { error: submitError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-confirmation`,
        },
        redirect: 'if_required'
      });
  
      if (submitError) {
        // Handle specific error types
        if (submitError.type === 'card_error') {
          setError(submitError.message || 'Your card was declined');
        } else if (submitError.type === 'validation_error') {
          setError('Please check your card details');
        } else {
          setError('Payment failed. Please try again.');
        }
        setProcessing(false);
        return;
      }
  
      // Only proceed if we have a successful payment
      if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent.id);
      } else {
        setError('Payment was not completed. Please try again.');
        setProcessing(false);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred');
      setProcessing(false);
    }
  }

  return (
    <div className="space-y-6">
      <PaymentElement />
      
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button 
        onClick={handleSubmit}
        disabled={!stripe || processing}
        className="w-full"
        size="lg"
      >
        {processing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Complete Purchase
          </>
        )}
      </Button>
    </div>
  )
}