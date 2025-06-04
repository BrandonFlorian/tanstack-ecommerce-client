import { CreditCard } from "lucide-react"
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js'
import { useState } from "react"
import { Button } from "./ui/button"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "./ui/alert"
import { usePaymentStore } from "@/stores/paymentStore"
import { useRouter } from '@tanstack/react-router'

export function CheckoutForm({ 
  clientSecret,
  onSuccess 
}: { 
  clientSecret: string
  onSuccess: (paymentIntentId: string) => void 
}) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  const { setProcessing: setModalProcessing, setStep, step } = usePaymentStore()

  const handleSubmit = async () => {
    if (!stripe || !elements) return

    setProcessing(true)
    setError(null)

    const returnUrl = `${window.location.origin}/order-confirmation`

    try {
      // ✅ Show modal immediately AFTER we start the Stripe call
      setModalProcessing(true, 'Processing your payment...')
      setStep('processing')

      const { error: submitError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl,
        },
        redirect: 'if_required'
      });
  
      if (submitError) {
        // ✅ Hide modal and show error on payment form
        setModalProcessing(false)
        setStep('payment')
        
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
  
      // ✅ Payment succeeded - update modal message
      if (paymentIntent && paymentIntent.status === 'succeeded') {
        setModalProcessing(true, 'Payment successful! Creating your order...')
        onSuccess(paymentIntent.id);
      } else {
        // ✅ Hide modal and show error
        setModalProcessing(false)
        setStep('payment')
        setError('Payment was not completed. Please try again.');
        setProcessing(false);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      // ✅ Hide modal and show error
      setModalProcessing(false)
      setStep('payment')
      setError('An unexpected error occurred');
      setProcessing(false);
    }
  }

  const isProcessingPayment = step === 'processing' || processing

  return (
    <div className="space-y-6">
      <div className={isProcessingPayment ? 'opacity-50 pointer-events-none' : ''}>
        <PaymentElement />
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button 
        onClick={handleSubmit}
        disabled={!stripe || isProcessingPayment}
        className="w-full"
        size="lg"
      >
        {isProcessingPayment ? (
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