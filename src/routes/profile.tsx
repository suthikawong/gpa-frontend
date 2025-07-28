import { api } from '@/api'
import toast from '@/components/common/toast'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

export const Route = createFileRoute('/profile')({
  component: RouteComponent,
  beforeLoad: ({ context, location }) => {
    if (!context.user?.userId) {
      throw redirect({
        to: '/signin',
        search: {
          redirect: location.href,
        },
      })
    }
  },
})

const formSchema = z.object({
  name: z.string().min(1, { message: 'Please enter your name.' }),
  email: z.string().min(1, { message: 'Please enter your email address.' }).email('This is not a valid email.'),
})

function RouteComponent() {
  const { user, setUser } = useAuth()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
    },
  })

  const mutation = useMutation({
    mutationFn: api.user.updateUser,
    onSuccess: (res) => {
      const user = res.data ?? null
      setUser(user)
      toast.success('Successfully update profile.')
    },
    onError: () => {
      toast.error('Something went wrong. Please try again.')
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    mutation.mutate({ userId: user?.userId!, name: values.name })
  }

  return (
    <DashboardLayout className="gap-4">
      <div className="flex justify-between items-center md:mb-4">
        <div className="text-xl font-bold md:text-3xl">Profile</div>
      </div>
      <Card className="flex gap-4 w-full h-full shadow-none border-0">
        <CardContent className="h-full">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 h-full flex flex-col"
            >
              <div className="flex-grow">
                <div className="bg-primary rounded-xl flex justify-center items-center text-white text-5xl w-30 h-30 m-auto mt-10 mb-16">
                  {user?.name?.[0] ?? ''}
                </div>
                <div className="grid md:grid-cols-2 w-full items-center gap-8">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            disabled
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button loading={mutation.isPending}>Update Profile</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
