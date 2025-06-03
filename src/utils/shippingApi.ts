import { createServerFn } from '@tanstack/react-start'
import { ApiServerClient } from '@/lib/apiServerClient'
import { getServerSessionForApi } from '@/utils/supabase'
import { EXPRESS_SERVER_URL_WITH_PORT } from '@/config/constants'

export const calculateShippingRates = createServerFn({ method: 'POST' })
  .validator((data: { address_id: string; cart_id: string }) => data)
  .handler(async ({ data }) => {
    const session = await getServerSessionForApi()
    if (!session) throw new Error('Not authenticated')
    
    const api = new ApiServerClient(EXPRESS_SERVER_URL_WITH_PORT, session.access_token)
    const response = await api.post<{
      data: Array<{
        service_code: string
        service_name: string
        rate: number
        estimated_days: number
      }>
    }>('/api/shipping/calculate', data)
    
    return response.data
  })