import { useState, useEffect } from 'react'
import { 
  useAddresses, 
  useCreateAddress, 
  useUpdateAddress, 
  useDeleteAddress,
  useSetDefaultAddress 
} from '@/hooks/useAddresses'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useForm } from '@tanstack/react-form'
import { MapPin, Plus, Edit, Trash, Star } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import type { Address } from '@/types/user'
import { toast } from "sonner"
import { useSession } from '@/hooks/useSession'

export function AddressManagement() {
  const { data: addresses, isLoading } = useAddresses()
  const createAddress = useCreateAddress()
  const updateAddress = useUpdateAddress()
  const deleteAddress = useDeleteAddress()
  const setDefaultAddress = useSetDefaultAddress()
  const { session } = useSession()
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [deletingAddressId, setDeletingAddressId] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      name: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'US',
      is_default: false,
    },
    onSubmit: async ({ value }) => {
      try {
        if (editingAddress) {
          await updateAddress.mutateAsync({
            id: editingAddress.id,
            data: value
          })
          toast("Address updated",{
            description: "Your address has been updated successfully.",
            duration: 2000,
            position: "top-right",
            className: "bg-green-500 text-white"
          })
        } else {
          await createAddress.mutateAsync(value)
          toast("Address added",{
            description: "Your new address has been added successfully.",
            duration: 2000,
            position: "top-right",
            className: "bg-green-500 text-white"
          })
        }
        setIsAddDialogOpen(false)
        setEditingAddress(null)
        form.reset()
      } catch (error) {
        toast("Error",{
          description: editingAddress ? "Failed to update address" : "Failed to add address",
          duration: 2000,
          position: "top-right",
          className: "bg-destructive text-destructive-foreground"
        }) 
      }
    },
  })

  // Populate form when editing
  useEffect(() => {
    if (editingAddress) {
      form.reset({
        name: editingAddress.name,
        address_line1: editingAddress.address_line1,
        address_line2: editingAddress.address_line2 || '',
        city: editingAddress.city,
        state: editingAddress.state,
        postal_code: editingAddress.postal_code,
        country: editingAddress.country,
        is_default: editingAddress.is_default,
      })
    }
  }, [editingAddress, form])

  const handleDelete = async (id: string) => {
    try {
      await deleteAddress.mutateAsync(id)
      toast("Address deleted",{
        description: "The address has been removed from your account.",
        duration: 2000,
        position: "top-right",
        className: "bg-green-500 text-white"
      })
      setDeletingAddressId(null)
    } catch (error) {
      toast("Error",{
        description: "Failed to delete address",
        duration: 2000,
        position: "top-right",
        className: "bg-destructive text-destructive-foreground"
      })
    }
  }

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultAddress.mutateAsync(id)
      toast("Default address updated",{
        description: "Your default address has been updated.",
        duration: 2000,
        position: "top-right",
        className: "bg-green-500 text-white"
      })
    } catch (error) {
      toast("Error",{
        description: "Failed to set default address",
        duration: 2000,
        position: "top-right",
        className: "bg-destructive text-destructive-foreground"
      })
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Addresses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Addresses</CardTitle>
            <Button size="sm" onClick={() => {
              setEditingAddress(null)
              form.reset()
              setIsAddDialogOpen(true)
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Address
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {addresses && addresses.length > 0 ? (
            <div className="grid gap-4">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className="border rounded-lg p-4 space-y-2 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{address.name}</p>
                          {address.is_default && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {address.address_line1}
                          {address.address_line2 && (
                            <>
                              <br />
                              {address.address_line2}
                            </>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {address.city}, {address.state} {address.postal_code}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {address.country}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {!address.is_default && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSetDefault(address.id)}
                          disabled={setDefaultAddress.isPending}
                        >
                          Set as default
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingAddress(address)
                          setIsAddDialogOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingAddressId(address.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No addresses saved yet</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => {
                  setEditingAddress(null)
                  form.reset()
                  setIsAddDialogOpen(true)
                }}
              >
                Add Your First Address
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Address Dialog */}
      <Dialog 
        open={isAddDialogOpen} 
        onOpenChange={(open) => {
          if (!open) {
            setIsAddDialogOpen(false)
            setEditingAddress(null)
            form.reset()
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={form.handleSubmit} className="space-y-4">
            <form.Field name="name">
              {(field) => (
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    required
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="address_line1">
              {(field) => (
                <div>
                  <Label htmlFor="address_line1">Address Line 1</Label>
                  <Input
                    id="address_line1"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    required
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="address_line2">
              {(field) => (
                <div>
                  <Label htmlFor="address_line2">Address Line 2 (Optional)</Label>
                  <Input
                    id="address_line2"
                    value={field.state.value || ''}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>

            <div className="grid grid-cols-2 gap-4">
              <form.Field name="city">
                {(field) => (
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      required
                    />
                  </div>
                )}
              </form.Field>

              <form.Field name="state">
                {(field) => (
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      required
                    />
                  </div>
                )}
              </form.Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <form.Field name="postal_code">
                {(field) => (
                  <div>
                    <Label htmlFor="postal_code">Postal Code</Label>
                    <Input
                      id="postal_code"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      required
                    />
                  </div>
                )}
              </form.Field>

              <form.Field name="country">
                {(field) => (
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      required
                    />
                  </div>
                )}
              </form.Field>
            </div>

            <form.Field name="is_default">
              {(field) => (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_default"
                    checked={field.state.value}
                    onCheckedChange={(checked) => field.handleChange(checked === true)}
                  />
                  <Label htmlFor="is_default" className="cursor-pointer">
                    Set as default address
                  </Label>
                </div>
              )}
            </form.Field>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false)
                  setEditingAddress(null)
                  form.reset()
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createAddress.isPending || updateAddress.isPending}
              >
                {createAddress.isPending || updateAddress.isPending 
                  ? 'Saving...' 
                  : editingAddress ? 'Update Address' : 'Save Address'
                }
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={!!deletingAddressId} 
        onOpenChange={(open) => !open && setDeletingAddressId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Address</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this address? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingAddressId && handleDelete(deletingAddressId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}