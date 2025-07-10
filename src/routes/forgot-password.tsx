import AuthenLayout from '@/components/layouts/AuthenLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { createFileRoute, Link, redirect } from '@tanstack/react-router'
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

// const resetPasswordFormSchema = z
//   .object({
//     code: z.string().length(6, 'Please enter 6-digit code that was sent to your email'),
//     password: z.string().min(1, 'Please enter your new password'),
//     confirmPassword: z.string().min(1, 'Please enter your new password again'),
//   })
//   .refine((data) => data.password === data.confirmPassword, {
//     message: 'Passwords do not match',
//     path: ['confirmPassword'],
//   })

function RouteComponent() {
  // const router = useRouter()
  // const search = Route.useSearch()
  // const [code, setCode] = useState(null)

  return (
    <AuthenLayout>
      <Card className="w-full max-w-[400px] m-6">
        <ForgotPasswordForm />
        {/* <ResetPasswordForm /> */}
      </Card>
    </AuthenLayout>
  )
}

const ForgotPasswordForm = () => {
  const form = useForm<z.infer<typeof forgotPasswordFormSchema>>({
    resolver: zodResolver(forgotPasswordFormSchema),
    defaultValues: {
      email: '',
    },
  })

  // const mutation = useMutation({
  //   mutationFn: api.auth.login,
  //   onSuccess: (res) => {
  //     // router.history.push(search?.redirect ?? '/')
  //   },
  //   onError: () => {
  //     toast.error('Something went wrong. Please try again.')
  //   },
  // })

  // const onSubmit = async (values: z.infer<typeof forgotPasswordFormSchema>) => {
  //   // mutation.mutate(values)
  // }

  return (
    <>
      <CardHeader>
        <CardTitle className="text-2xl md:text-3xl m-auto mb-2">Forgot password</CardTitle>
        <CardDescription className="m-auto md:text-base text-center">
          Provide your account's email for which you want to reset your password
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form
          // onSubmit={form.handleSubmit(onSubmit)}
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
              // loading={mutation.isPending}
              type="submit"
              className="w-full"
            >
              Send code
            </Button>
            <Link
              className="text-[13px] text-primary font-semibold"
              to="/signin"
            >
              Back to login
            </Link>
          </CardFooter>
        </form>
      </Form>
    </>
  )
}

// const ResetPasswordForm = () => {
//   const form = useForm<z.infer<typeof resetPasswordFormSchema>>({
//     resolver: zodResolver(resetPasswordFormSchema),
//     defaultValues: {
//       code: '',
//       password: '',
//       confirmPassword: '',
//     },
//   })

//   // const mutation = useMutation({
//   //   mutationFn: api.auth.login,
//   //   onSuccess: (res) => {
//   //     // router.history.push(search?.redirect ?? '/')
//   //   },
//   //   onError: () => {
//   //     toast.error('Something went wrong. Please try again.')
//   //   },
//   // })

//   const onSubmit = async (values: z.infer<typeof resetPasswordFormSchema>) => {
//     // mutation.mutate(values)
//   }

//   return (
//     <>
//       <CardHeader>
//         <CardTitle className="text-2xl md:text-3xl m-auto mb-2">Check your email</CardTitle>
//         <CardDescription className="m-auto md:text-base text-center">
//           Please enter you 6-digit code. Then create and confirm your new password.
//         </CardDescription>
//       </CardHeader>
//       <Form {...form}>
//         <form
//           onSubmit={form.handleSubmit(onSubmit)}
//           className="space-y-8"
//         >
//           <CardContent>
//             <div className="grid w-full items-center gap-4">
//               <FormField
//                 control={form.control}
//                 name="code"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>6-digit code</FormLabel>
//                     <FormControl>
//                       <Input {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control}
//                 name="password"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Password</FormLabel>
//                     <FormControl>
//                       <Input {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control}
//                 name="confirmPassword"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Confirm Password</FormLabel>
//                     <FormControl>
//                       <Input {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </div>
//           </CardContent>
//           <CardFooter className="flex-col gap-y-6">
//             <Button
//               // loading={mutation.isPending}
//               type="submit"
//               className="w-full"
//             >
//               Reset password
//             </Button>
//             <Link
//               className="text-[13px] text-primary font-semibold"
//               to="/signin"
//             >
//               Back to login
//             </Link>
//           </CardFooter>
//         </form>
//       </Form>
//     </>
//   )
// }
