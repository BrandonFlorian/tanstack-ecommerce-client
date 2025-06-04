import { create } from 'zustand'
import { PaymentIntent } from '@/types/payment'

interface CheckoutState {
  // Checkout flow state
  step: 'addresses' | 'shipping' | 'payment' | 'processing' | 'complete'
  
  // Selected options
  shippingAddressId?: string
  billingAddressId?: string
  sameAsShipping: boolean
  shippingMethod?: string
  selectedShippingRate?: any
  
  // Payment intent
  paymentIntent?: PaymentIntent
  paymentIntentId?: string
  
  // ✅ Fixed: Better processing state management
  isProcessing: boolean
  processingMessage?: string
  error?: string
  
  // Actions
  setStep: (step: CheckoutState['step']) => void
  setShippingAddress: (id: string) => void
  setBillingAddress: (id: string) => void
  setSameAsShipping: (same: boolean) => void
  setShippingMethod: (method: string, rate: any) => void
  setPaymentIntent: (intent: PaymentIntent) => void
  setProcessing: (processing: boolean, message?: string) => void
  setError: (error?: string) => void
  reset: () => void
  
  // Computed
  canProceedToShipping: () => boolean
  canProceedToPayment: () => boolean
}

const initialState = {
  step: 'addresses' as const,
  sameAsShipping: true,
  isProcessing: false,
}

export const usePaymentStore = create<CheckoutState>((set, get) => ({
  ...initialState,
  
  setStep: (step) => {
    set({ step })
    // ✅ Clear processing state when changing steps (except to processing)
    if (step !== 'processing') {
      set({ isProcessing: false, processingMessage: undefined, error: undefined })
    }
  },
  
  setShippingAddress: (id) => set((state) => ({
    shippingAddressId: id,
    billingAddressId: state.sameAsShipping ? id : state.billingAddressId
  })),
  
  setBillingAddress: (id) => set({ billingAddressId: id }),
  
  setSameAsShipping: (same) => set((state) => ({
    sameAsShipping: same,
    billingAddressId: same ? state.shippingAddressId : state.billingAddressId
  })),
  
  setShippingMethod: (method, rate) => set({
    shippingMethod: method,
    selectedShippingRate: rate
  }),
  
  setPaymentIntent: (intent) => set({
    paymentIntent: intent,
    paymentIntentId: intent.paymentIntentId
  }),
  
  // ✅ Fixed: Only set processing when actually processing payment
  setProcessing: (processing, message) => set({
    isProcessing: processing,
    processingMessage: message,
    error: processing ? undefined : get().error // Don't clear errors when stopping processing
  }),
  
  setError: (error) => set({
    error,
    isProcessing: false,
    processingMessage: undefined
  }),
  
  reset: () => set(initialState),
  
  canProceedToShipping: () => {
    const state = get()
    return !!state.shippingAddressId && !!state.billingAddressId
  },
  
  canProceedToPayment: () => {
    const state = get()
    return !!state.shippingMethod && !!state.selectedShippingRate
  },
}))

// ✅ Enhanced selectors with better state management
export const useCheckoutStep = () => usePaymentStore((state) => state.step)
export const useIsProcessingPayment = () => usePaymentStore((state) => state.isProcessing && state.step === 'processing')
export const useCheckoutError = () => usePaymentStore((state) => state.error)