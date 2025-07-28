import { api } from '@/api'
import email from '@/assets/email.png'
import toast from '@/components/common/toast'
import AuthenLayout from '@/components/layouts/AuthenLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { createFileRoute, Link, redirect, useRouter } from '@tanstack/react-router'
import { AxiosError } from 'axios'
import { ErrorResponse } from 'gpa-backend/src/app.response'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

export const Route = createFileRoute('/forgot-password')({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    if (context.user?.userId) {
      throw redirect({
        to: '/',
      })
    }
  },
  validateSearch: z.object({
    redirect: z.string().optional(),
  }),
})

const forgotPasswordFormSchema = z.object({
  email: z.string().min(1, 'Please enter your email').email('This is not a valid email.'),
})

function RouteComponent() {
  return (
    <AuthenLayout>
      <ForgotPasswordCard />
    </AuthenLayout>
  )
}

const ForgotPasswordCard = () => {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const form = useForm<z.infer<typeof forgotPasswordFormSchema>>({
    resolver: zodResolver(forgotPasswordFormSchema),
    defaultValues: {
      email: '',
    },
  })

  const mutation = useMutation({
    mutationFn: api.auth.forgotPassword,
    onSuccess: () => setStep(2),
    onError: (error: AxiosError<ErrorResponse>) => {
      if (error.response?.status === 404) {
        // ignore error
        setStep(2)
      } else {
        toast.error('Something went wrong. Please try again.')
      }
    },
  })

  const onSubmit = async (values: z.infer<typeof forgotPasswordFormSchema>) => {
    mutation.mutate(values)
  }

  const onClickSignIn = () => {
    router.history.push(`/signin`)
  }

  if (step === 2) {
    return (
      <Card className="w-full max-w-[600px] m-6">
        <div className="flex flex-col gap-8 items-center justify-center my-8 px-6 sm:px-10">
          <img
            src={email}
            alt="email image"
          />
          <div className="flex flex-col gap-6 items-center justify-center">
            <h4 className="text-3xl font-semibold">Check Your Email</h4>
            <div className="text-muted-foreground text-center">
              We've sent a link to your email address to reset your password. Please check your inbox and follow the
              instructions to set a new password.
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
    )
  }

  return (
    <Card className="w-full max-w-[400px] m-6">
      <CardHeader>
        <CardTitle className="text-2xl md:text-3xl md:mb-3 m-auto mb-2">Forgot password</CardTitle>
        <CardDescription className="m-auto text-center">
          Provide your account's email for which you want to reset your password
        </CardDescription>
      </CardHeader>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8"
        >
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-y-6">
            <Button
              loading={mutation.isPending}
              type="submit"
              className="w-full"
            >
              Send Email
            </Button>
            <Link
              className="text-[13px] text-primary font-semibold"
              to="/signin"
            >
              Back to Sign In
            </Link>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
