import { api } from '@/api'
import cancel from '@/assets/cancel.png'
import checked from '@/assets/checked.png'
import SuspenseArea from '@/components/common/SuspenseArea'
import AuthenLayout from '@/components/layouts/AuthenLayout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { z } from 'zod'

export const Route = createFileRoute('/verify-email')({
  component: RouteComponent,
  validateSearch: z.object({
    token: z.coerce.string(),
  }),
})

function RouteComponent() {
  const search = Route.useSearch()
  const token = search.token

  const { data: res, isLoading } = useQuery({
    queryKey: ['verifyEmail', token],
    queryFn: async () => await api.auth.verifyEmail({ token }),
    enabled: !!token,
  })
  const data = res?.data

  if (isLoading) {
    return (
      <SuspenseArea
        loading={isLoading}
        className="items-center"
      />
    )
  }
  if (token && data) {
    return <VerifyEmailSuccessfully />
  }
  return <VerifyEmailFailed />
}

const VerifyEmailSuccessfully = () => {
  const router = useRouter()

  const onClickSignIn = () => {
    router.history.push(`/signin`)
  }

  return (
    <AuthenLayout>
      <Card className="w-full max-w-[600px] m-6">
        <div className="flex flex-col gap-8 items-center justify-center my-8 px-6 sm:px-10">
          <img
            src={checked}
            alt="checked image"
          />
          <div className="flex flex-col gap-6 items-center justify-center">
            <h4 className="text-3xl font-semibold">Account Activated</h4>
            <div className="text-muted-foreground text-center">
              Thank you, your email has been verified. Your account is now active. Please use the link below to sign in
              to your account
            </div>
          </div>
        </div>
        <Button
          onClick={onClickSignIn}
          size="lg"
          className="w-fit m-auto"
        >
          Sign in to your account
        </Button>
      </Card>
    </AuthenLayout>
  )
}

const VerifyEmailFailed = () => {
  const router = useRouter()

  const onClickSignIn = () => {
    router.history.push(`/signin`)
  }

  return (
    <AuthenLayout>
      <Card className="w-full max-w-[600px] m-6">
        <div className="flex flex-col gap-8 items-center justify-center my-8 px-6 sm:px-10">
          <img
            src={cancel}
            alt="cancel image"
          />
          <div className="flex flex-col gap-6 items-center justify-center">
            <h4 className="text-3xl font-semibold">Verificaiton Failed</h4>
            <div className="text-muted-foreground text-center">
              An invalid verification link was used. Please make sure you copied the correct link into your browser. You
              can sign in and request a new verification email if needed.
            </div>
          </div>
        </div>
        <Button
          onClick={onClickSignIn}
          size="lg"
          className="w-fit m-auto"
        >
          Back to Sign In
        </Button>
      </Card>
    </AuthenLayout>
  )
}
