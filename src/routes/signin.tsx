import { api } from '@/api'
import toast from '@/components/common/toast'
import AuthenLayout from '@/components/layouts/AuthenLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { createFileRoute, Link, redirect, useRouter } from '@tanstack/react-router'
import { AxiosError } from 'axios'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

export const Route = createFileRoute('/signin')({
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

const formSchema = z.object({
  email: z.string().email('This is not a valid email.'),
  password: z.string(),
})

function RouteComponent() {
  const router = useRouter()
  const search = Route.useSearch()
  const { setUser } = useAuth()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const mutation = useMutation({
    mutationFn: api.auth.login,
    onSuccess: (res) => {
      setUser(res.data)
      router.history.push(search?.redirect ?? '/')
    },
    onError: (error: AxiosError) => {
      if (error.response?.status === 401) {
        setErrorMessage('Incorrect email or password')
      } else if (error.response?.status === 403) {
        setErrorMessage('Your email is not verified. Please verify your email before sign in.')
      } else {
        toast.error('Something went wrong. Please try again.')
      }
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setErrorMessage(null)
    mutation.mutate(values)
  }

  return (
    <AuthenLayout>
      <Card className="w-full max-w-[400px] m-6">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl m-auto">Sign In</CardTitle>
          <CardDescription className="m-auto md:text-base">Sign in to your account</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
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
                <div className="flex flex-col space-y-1.5">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                        {errorMessage && <FormMessage>{errorMessage}</FormMessage>}
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-y-6">
              <Link
                className="text-[13px] text-primary font-semibold self-end"
                to="/forgot-password"
              >
                Forgot password?
              </Link>
              <Button
                loading={mutation.isPending}
                type="submit"
                className="w-full"
              >
                Sign In
              </Button>
              <div className="flex gap-x-2">
                <Label className="text-[13px]">Don't have an account?</Label>
                <Link
                  className="text-[13px] text-primary font-semibold self-end"
                  to="/signup"
                >
                  Sign up
                </Link>
              </div>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </AuthenLayout>
  )
}
