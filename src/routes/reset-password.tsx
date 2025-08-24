import { api } from '@/api'
import cancel from '@/assets/cancel.png'
import checked from '@/assets/checked.png'
import AuthenLayout from '@/components/layouts/AuthenLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { createFileRoute, Link, redirect, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

export const Route = createFileRoute('/reset-password')({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    if (context.user?.userId) {
      throw redirect({
        to: '/',
      })
    }
  },
  validateSearch: z.object({
    token: z.coerce.string(),
  }),
})

const resetPasswordFormSchema = z
  .object({
    password: z
      .string()
      .min(1, 'Please enter your new password')
      .min(8, { message: 'Password must be at least 8 characters' }),
    confirmPassword: z.string().min(1, 'Please enter your new password again'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

function RouteComponent() {
  const [state, setState] = useState<number | null>(null)

  if (state === 1) {
    return <ResetPasswordSuccessfully />
  }
  if (state === 2) {
    return <ResetPasswordFailed />
  }
  return <ResetPasswordCard setState={setState} />
}

const ResetPasswordCard = ({ setState }: { setState: React.Dispatch<React.SetStateAction<number | null>> }) => {
  const search = Route.useSearch()
  const token = search.token
  const form = useForm<z.infer<typeof resetPasswordFormSchema>>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  const mutation = useMutation({
    mutationFn: api.auth.resetPassword,
    onSuccess: () => setState(1),
    onError: () => setState(2),
  })

  const onSubmit = async (values: z.infer<typeof resetPasswordFormSchema>) => {
    mutation.mutate({ token, password: values.password })
  }

  return (
    <AuthenLayout>
      <Card className="w-full max-w-[400px] m-6">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl m-auto mb-2">Reset Password</CardTitle>
          <CardDescription className="m-auto text-center">
            You can now reset your password by entering and confirming a new one below.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8"
          >
            <CardContent>
              <div className="grid w-full items-center gap-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-y-6">
              <Button
                loading={mutation.isPending}
                type="submit"
                className="w-full"
              >
                Reset Password
              </Button>
              <Link
                className="text-[13px] text-primary font-semibold"
                to="/signin"
              >
                Back to Login
              </Link>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </AuthenLayout>
  )
}

const ResetPasswordSuccessfully = () => {
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
            <h4 className="text-3xl font-semibold">Password Reset Successful</h4>
            <div className="text-muted-foreground text-center">
              Your password has been successfully reset. You can now sign in using your new password.
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

const ResetPasswordFailed = () => {
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
            <h4 className="text-3xl font-semibold">Password Reset Failed</h4>
            <div className="text-muted-foreground text-center">
              The password reset link is invalid or has expired. Please request a new password reset and try again.
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
