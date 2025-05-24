import { useForm } from '@tanstack/react-form'
import { useProfile, useUpdateProfile } from '@/hooks/useProfile'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useSession } from '@/hooks/useSession' 
import { getSupabaseServerClient } from '@/utils/supabase'
import { ApiServerClient } from '@/lib/apiServerClient'
import { EXPRESS_SERVER_URL_WITH_PORT } from '@/config/constants'
import { createFileRoute, useLoaderData } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import React from 'react'

export const getProfileServer = createServerFn({ method: 'GET' }).handler(async () => {
  // Get the Supabase session (from cookies)
  const supabase = getSupabaseServerClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error || !session) {
    throw new Error('Not authenticated')
  }
  const token = session.access_token

  // Use the server API client to fetch the profile
  const api = new ApiServerClient(EXPRESS_SERVER_URL_WITH_PORT, token)
  return api.get('/api/users/me')
})

export const Route = createFileRoute('/_authed/profile')({
  loader: async () => {
    // Fetch the profile server-side
    const profile = await getProfileServer()
    console.log('profile', profile)
    return { profile }
  },
  component: ProfilePage,
})

type ProfileResponse = {
  profile: {
    data: {
      first_name: string
      last_name: string
      email: string
      phone: string
    },
    status: string
  }
}

export default function ProfilePage() {
  const loaderData: ProfileResponse = useLoaderData({ from: '/_authed/profile' })
  const { session, isLoading: sessionLoading } = useSession()
  const token = session?.access_token

  console.log('loaderData', loaderData.profile.data)
  // Pass initialData to useProfile
  const { data: profile, isLoading } = useProfile(token, {
    initialData: loaderData.profile.data,
  })
  const updateProfile = useUpdateProfile(token)

  const form = useForm({
    defaultValues: {
      first_name: profile?.first_name ?? '',
      last_name: profile?.last_name ?? '',
      email: profile?.email ?? '',
      phone: profile?.phone ?? '',
    },
    onSubmit: async ({ value }) => {
      await updateProfile.mutateAsync(value)
    },
  })

  React.useEffect(() => {
    if (profile) {
      form.reset({
        first_name: profile.first_name ?? '',
        last_name: profile.last_name ?? '',
        email: profile.email ?? '',
        phone: profile.phone ?? '',
      })
    }
  }, [profile])
  
  // Wait for both session and profile to load
  if (isLoading || sessionLoading) return <div>Loading...</div>


  return (
    <form onSubmit={form.handleSubmit}>
      <form.Field name="first_name">
        {(field) => (
          <Input
            value={field.state.value}
            onChange={e => field.handleChange(e.target.value)}
            placeholder="First Name"
          />
        )}
      </form.Field>
      <form.Field name="last_name">
        {(field) => (
          <Input
            value={field.state.value}
            onChange={e => field.handleChange(e.target.value)}
            placeholder="Last Name"
          />
        )}
      </form.Field>
      <form.Field name="email">
        {(field) => (
          <Input
            value={field.state.value}
            onChange={e => field.handleChange(e.target.value)}
            placeholder="Email"
            disabled
          />
        )}
      </form.Field>
      <form.Field name="phone">
        {(field) => (
          <Input
            value={field.state.value}
            onChange={e => field.handleChange(e.target.value)}
            placeholder="Phone"
          />
        )}
      </form.Field>
      <form.Subscribe selector={formState => [formState.canSubmit, formState.isSubmitting]}>
        {([canSubmit, isSubmitting]) => (
          <Button type="submit" disabled={!canSubmit || updateProfile.isPending}>
            {isSubmitting || updateProfile.isPending ? 'Saving...' : 'Save'}
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}