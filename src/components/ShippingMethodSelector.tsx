import { Card, CardContent } from "./ui/card"

export function ShippingMethodSelector({
  methods,
  selectedMethod,
  onSelect
}: {
  methods: Array<{
    service_code: string
    service_name: string
    rate: number
    estimated_days: string
  }>
  selectedMethod?: string
  onSelect: (method: string) => void
}) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price / 100)
  }

  return (
    <div className="space-y-3">
      <h3 className="font-medium">Shipping Method</h3>
      <div className="grid gap-3">
        {methods.map((method) => (
          <button
            key={method.service_code}
            type="button"
            onClick={() => onSelect(method.service_code)}
            className="w-full text-left"
          >
            <Card 
              className={`cursor-pointer transition-all ${
                selectedMethod === method.service_code 
                  ? 'ring-2 ring-primary' 
                  : 'hover:shadow-md'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{method.service_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {method.estimated_days}
                    </p>
                  </div>
                  <p className="font-semibold">{formatPrice(method.rate)}</p>
                </div>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>
    </div>
  )
}