import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { 
  fetchAddresses, 
  createAddress, 
  updateAddress, 
  deleteAddress 
} from "@/utils/paymentApi"
import { Address } from "@/types/user"
import { CreateAddressData } from "@/types/payment"

// Fetch all addresses
export function useAddresses() {
  return useQuery({
    queryKey: ['addresses'],
    queryFn: () => fetchAddresses({ data: undefined }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Create new address
export function useCreateAddress() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateAddressData) => 
      createAddress({ data }),
    onSuccess: (newAddress) => {
      // Optimistically update the cache
      queryClient.setQueryData(['addresses'], (old: Address[] | undefined) => {
        if (!old) return [newAddress]
        return [...old, newAddress]
      })
      // Also invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
    }
  })
}

// Update existing address
export function useUpdateAddress() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { 
      id: string; 
      data: Partial<CreateAddressData>
    }) => updateAddress({ data: { ...data, id } }),
    onSuccess: (updatedAddress) => {
      // Update the specific address in cache
      queryClient.setQueryData(['addresses'], (old: Address[] | undefined) => {
        if (!old) return []
        return old.map(addr => 
          addr.id === updatedAddress.id ? updatedAddress : addr
        )
      })
      // Also invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
    }
  })
}

// Delete address
export function useDeleteAddress() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => deleteAddress({ data: id }),
    onMutate: async (deletedId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['addresses'] })
      
      // Snapshot the previous value
      const previousAddresses = queryClient.getQueryData(['addresses'])
      
      // Optimistically update by removing the address
      queryClient.setQueryData(['addresses'], (old: Address[] | undefined) => {
        if (!old) return []
        return old.filter(addr => addr.id !== deletedId)
      })
      
      // Return a context object with the snapshotted value
      return { previousAddresses }
    },
    onError: (err, deletedId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousAddresses) {
        queryClient.setQueryData(['addresses'], context.previousAddresses)
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
    }
  })
}

// Set default address
export function useSetDefaultAddress() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => 
      updateAddress({ data: { id, is_default: true } }),
    onSuccess: (updatedAddress) => {
      // Update cache to set this as default and unset others
      queryClient.setQueryData(['addresses'], (old: Address[] | undefined) => {
        if (!old) return []
        return old.map(addr => ({
          ...addr,
          is_default: addr.id === updatedAddress.id
        }))
      })
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
    }
  })
}