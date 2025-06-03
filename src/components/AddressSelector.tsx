import { Address } from "@/types/user"
import { Card, CardContent } from "./ui/card"
import { Button } from "./ui/button"

export function AddressSelector({ 
  addresses, 
  selectedId, 
  onSelect,
  onAddNew,
  label = "Address"
}: {
  addresses: Address[]
  selectedId?: string
  onSelect: (id: string) => void
  onAddNew: () => void
  label?: string
}) {
  return (
    <div className="space-y-3">
      <h3 className="font-medium">{label}</h3>
      <div className="grid gap-3">
        {addresses.map((address) => (
          <Card 
            key={address.id}
            className={`cursor-pointer transition-all ${
              selectedId === address.id 
                ? 'ring-2 ring-primary' 
                : 'hover:shadow-md'
            }`}
            onClick={() => onSelect(address.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="font-medium">{address.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {address.address_line1}
                    {address.address_line2 && <><br />{address.address_line2}</>}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {address.city}, {address.state} {address.postal_code}
                  </p>
                  <p className="text-sm text-muted-foreground">{address.country}</p>
                </div>
                {address.is_default && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                    Default
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        <Button 
          variant="outline" 
          onClick={onAddNew}
          className="w-full"
        >
          Add New Address
        </Button>
      </div>
    </div>
  )
}