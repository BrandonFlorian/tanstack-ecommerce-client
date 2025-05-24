import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { EXPRESS_SERVER_URL_WITH_PORT } from '@/config/constants'

const API_URL = `${EXPRESS_SERVER_URL_WITH_PORT}/api/users/me` 

export function useProfile<TData = any>(
  token: string | undefined,
  options?: { initialData?: TData }
) {
  return useQuery<TData, Error>({
    queryKey: ['user-profiles'],
    queryFn: async () => {
      if (!token) throw new Error('No access token')
      const res = await fetch(`${API_URL}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Failed to fetch profile')
      const data = await res.json()
      return data.data
    },
    enabled: !!token,
    ...(options ?? {}),
  })
}

export function useUpdateProfile(token: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: any) => {
      if (!token) throw new Error('No access token')
      const res = await fetch(`${API_URL}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update profile')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profiles'] })
    },
  })
}