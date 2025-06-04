import { useForm } from '@tanstack/react-form'
import { useProfile, useUpdateProfile } from '@/hooks/useProfile'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useSession } from '@/hooks/useSession' 
import { getSupabaseServerClient } from '@/utils/supabase'
import { ApiServerClient } from '@/lib/apiServerClient'
import { EXPRESS_SERVER_URL_WITH_PORT } from '@/config/constants'
import { createFileRoute, useLoaderData } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import React from 'react'
import { AddressManagement } from '@/components/AddressManagement'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const getProfileServer = createServerFn({ method: 'GET' }).handler(async () => {
  const supabase = getSupabaseServerClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error || !session) {
    throw new Error('Not authenticated')
  }
  const token = session.access_token

  const api = new ApiServerClient(EXPRESS_SERVER_URL_WITH_PORT, token)
  return api.get('/api/users/me')
})

export const Route = createFileRoute('/_authed/profile')({
  loader: async () => {
    const profile = await getProfileServer()
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
  }, [profile, form])

  console.log("profile", profile)
  console.log("session", session)
  console.log("isLoading", isLoading)
  console.log("sessionLoading", sessionLoading)
  
  if (isLoading || sessionLoading) return <div>Loading...</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Profile</h1>
        
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">Profile Information</TabsTrigger>
            <TabsTrigger value="addresses">Addresses</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <form.Field name="first_name">
                      {(field) => (
                        <div>
                          <Label htmlFor="first_name">First Name</Label>
                          <Input
                            id="first_name"
                            value={field.state.value}
                            onChange={e => field.handleChange(e.target.value)}
                            placeholder="First Name"
                          />
                        </div>
                      )}
                    </form.Field>
                    
                    <form.Field name="last_name">
                      {(field) => (
                        <div>
                          <Label htmlFor="last_name">Last Name</Label>
                          <Input
                            id="last_name"
                            value={field.state.value}
                            onChange={e => field.handleChange(e.target.value)}
                            placeholder="Last Name"
                          />
                        </div>
                      )}
                    </form.Field>
                  </div>
                  
                  <form.Field name="email">
                    {(field) => (
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          value={field.state.value}
                          onChange={e => field.handleChange(e.target.value)}
                          placeholder="Email"
                          disabled
                        />
                      </div>
                    )}
                  </form.Field>
                  
                  <form.Field name="phone">
                    {(field) => (
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={field.state.value}
                          onChange={e => field.handleChange(e.target.value)}
                          placeholder="Phone"
                        />
                      </div>
                    )}
                  </form.Field>
                  
                  <form.Subscribe selector={formState => [formState.canSubmit, formState.isSubmitting]}>
                    {([canSubmit, isSubmitting]) => (
                      <Button 
                        type="submit" 
                        disabled={!canSubmit || updateProfile.isPending}
                        className="w-full md:w-auto"
                      >
                        {isSubmitting || updateProfile.isPending ? 'Saving...' : 'Save Changes'}
                      </Button>
                    )}
                  </form.Subscribe>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="addresses">
            <AddressManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}