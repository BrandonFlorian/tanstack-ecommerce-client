import { useQuery } from "@tanstack/react-query"

import { fetchAddresses } from "@/utils/paymentApi"

import { useQueryClient } from "@tanstack/react-query"

import { Address } from "@/types/user"
import { createAddress } from "@/utils/paymentApi"
import { useMutation } from "@tanstack/react-query"

export function useAddresses() {
    return useQuery({
      queryKey: ['addresses'],
      queryFn: () => fetchAddresses({ data: undefined }),
      staleTime: 1000 * 60 * 5, // 5 minutes
    })
  }
  
export function useCreateAddress() {
    const queryClient = useQueryClient()
    
    return useMutation({
      mutationFn: (data: Omit<Address, 'id' | 'created_at' | 'updated_at'>) => 
        createAddress({ data }),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['addresses'] })
      }
    })
  }