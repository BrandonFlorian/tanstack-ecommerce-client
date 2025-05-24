import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card'

export function Auth({
    actionText,
    onSubmit,
    status,
    afterSubmit,
  }: {
    actionText: string
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
    status: 'pending' | 'idle' | 'success' | 'error'
    afterSubmit?: React.ReactNode
  }) {
    return (
      <div className="fixed inset-0 flex items-start justify-center p-8 bg-background/80">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">{actionText}</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                onSubmit(e)
              }}
              className="space-y-4"
            >
              <Input name="email" type="email" placeholder="Email" required />
              <Input name="password" type="password" placeholder="Password" required />
              <Button type="submit" className="w-full rounded py-2 uppercase" disabled={status === 'pending'}>
                {status === 'pending' ? 'Loading...' : actionText}
              </Button>
              {afterSubmit ? afterSubmit : null}
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-center gap-2">
          </CardFooter>
        </Card>
      </div>
    )
  }