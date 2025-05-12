import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { api } from '../api'

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

const formSchema = z.object({
  email: z.string().min(1, { message: 'This field has to be filled.' }).email('This is not a valid email.'),
  password: z.string().min(1, { message: 'This field has to be filled.' }),
})

function RouteComponent() {
  const { data: res, isLoading, error } = useQuery({ queryKey: ['cats'], queryFn: api.cat.getCats })
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log(values)
    await api.auth.login(values.email, values.password)
  }

  return (
    <>
      <div>
        <div className="max-w-sm">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8"
            >
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
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Login</Button>
            </form>
          </Form>
        </div>
        <div className="text-lg text-astronaut-900">Content</div>
        {isLoading && <p>Loading...</p>}
        {error && <p>Error occured: {error.message}</p>}
        {res?.data?.map((cat, index) => <p key={index}>{cat.name}</p>)}
      </div>
    </>
  )
}
