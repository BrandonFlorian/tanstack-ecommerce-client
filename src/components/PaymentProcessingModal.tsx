import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface PaymentProcessingModalProps {
  isOpen: boolean
  status: 'processing' | 'success' | 'error'
  message?: string
}

export function PaymentProcessingModal({ isOpen, status, message }: PaymentProcessingModalProps) {
  return (
    <Dialog open={isOpen} modal>
      <DialogContent 
        className="sm:max-w-md" 
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="flex flex-col items-center justify-center p-8 space-y-4">
          {status === 'processing' && (
            <>
              <div className="relative">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <div className="absolute inset-0 h-16 w-16 animate-ping opacity-20 bg-primary rounded-full" />
              </div>
              <h2 className="text-xl font-semibold">Processing Payment</h2>
              <p className="text-muted-foreground text-center">
                {message || "Please wait while we process your payment..."}
              </p>
              <div className="flex items-center gap-1 mt-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
              </div>
              <p className="text-xs text-muted-foreground text-center mt-4">
                Please do not close this window or refresh the page
              </p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="relative">
                <CheckCircle className="h-16 w-16 text-green-600" />
                <div className="absolute inset-0 h-16 w-16 animate-ping opacity-20 bg-green-600 rounded-full" />
              </div>
              <h2 className="text-xl font-semibold text-green-700">Payment Successful!</h2>
              <p className="text-muted-foreground text-center">
                {message || "Redirecting to your order confirmation..."}
              </p>
            </>
          )}
          
          {status === 'error' && (
            <>
              <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold text-destructive">Payment Failed</h2>
              <p className="text-muted-foreground text-center">
                {message || "Something went wrong. Please try again."}
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}