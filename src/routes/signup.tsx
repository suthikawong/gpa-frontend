import { api } from '@/api'
import instructor from '@/assets/instructor.png'
import student from '@/assets/student.png'
import toast from '@/components/common/toast'
import AuthenLayout from '@/components/layouts/AuthenLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Roles } from '@/config/app'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { Check } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

export const Route = createFileRoute('/signup')({
  component: RouteComponent,
  validateSearch: z.object({
    register: z.coerce.string().optional(),
  }),
})

const formSchema = z
  .object({
    name: z.string().min(1, { message: 'Please enter your name.' }),
    email: z.string().min(1, { message: 'Please enter your email address.' }).email('This is not a valid email.'),
    userNumber: z.string().optional(),
    password: z
      .string()
      .min(1, { message: 'Please enter your password.' })
      .min(8, { message: 'Password must be at least 8 characters' }),
    confirmPassword: z.string().min(1, { message: 'Please enter your password again.' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

function RouteComponent() {
  const search = Route.useSearch()

  if (search?.register) {
    if (search.register === Roles.Instructor.toString()) {
      return <SignUpForm formType={Roles.Instructor} />
    } else if (search.register === Roles.Student.toString()) {
      return <SignUpForm formType={Roles.Student} />
    }
  }
  return <SelectRegisterType />
}

const SelectRegisterType = () => {
  const router = useRouter()
  const [selected, setSelected] = useState<Roles | null>(Roles.Student)

  const isInstructor = selected === Roles.Instructor
  const isStudent = selected === Roles.Student

  const onClickNextStep = () => {
    if (selected) {
      router.history.push(`/signup?register=${selected}`)
    }
  }

  return (
    <AuthenLayout>
      <Card className="w-full max-w-[600px] m-6">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl m-auto">Select your role</CardTitle>
          <CardDescription className="m-auto md:text-base">Sign in to your account</CardDescription>
        </CardHeader>
        <div className="flex flex-col sm:flex-row gap-8 sm:gap-16 items-center justify-center mt-4">
          <div className="flex flex-col items-center">
            <div
              onClick={() => setSelected(Roles.Instructor)}
              className={cn('relative p-8 border-2 rounded-full', isInstructor && 'border-primary')}
            >
              <img
                src={instructor}
                alt="instructor image"
                className="w-[80px] opacity-80"
              />
              {isInstructor && (
                <div className="absolute top-0 right-0 flex items-center justify-center bg-primary rounded-full size-10">
                  <Check className="text-white" />
                </div>
              )}
            </div>
            <div className={cn('mt-2 sm:mt-4 text-lg sm:text-xl font-semibold', isInstructor && 'text-primary')}>
              Instructor
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div
              onClick={() => setSelected(Roles.Student)}
              className={cn(
                'relative p-8 flex-col items-center justify-center border-2 rounded-full',
                isStudent && 'border-primary'
              )}
            >
              <img
                src={student}
                alt="student image"
                className="w-[80px] opacity-80"
              />
              {isStudent && (
                <div className="absolute top-0 right-0 flex items-center justify-center bg-primary rounded-full size-10">
                  <Check className="text-white" />
                </div>
              )}
            </div>
            <div className={cn('mt-2 sm:mt-4 text-lg sm:text-xl font-semibold', isStudent && 'text-primary')}>
              Student
            </div>
          </div>
        </div>
        <Button
          onClick={onClickNextStep}
          className="w-fit m-auto mt-2"
        >
          Next Step
        </Button>
      </Card>
    </AuthenLayout>
  )
}

const SignUpForm = ({ formType }: { formType: Roles }) => {
  const router = useRouter()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      userNumber: '',
      password: '',
      confirmPassword: '',
    },
  })

  const createMutation = useMutation({
    mutationFn: api.auth.register,
    onSuccess: () => {
      router.history.push(`/signin`)
    },
    onError: () => {
      toast.error('Failed to sign up. Please try again.')
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    createMutation.mutate({
      ...values,
      roleId: formType,
      userNumber: values?.userNumber === '' ? undefined : values.userNumber,
    })
  }

  return (
    <AuthenLayout>
      <Card className="w-full max-w-[400px] m-6">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl m-auto">Sign Up</CardTitle>
          <CardDescription className="m-auto md:text-base">Create your account</CardDescription>
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
                </div>
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
                {formType === Roles.Student && (
                  <div className="flex flex-col space-y-1.5">
                    <FormField
                      control={form.control}
                      name="userNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Student ID</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
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
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            {...field}
                          />
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
                loading={createMutation.isPending}
                type="submit"
                className="w-full"
              >
                Create account
              </Button>
              <div className="flex gap-x-2">
                <Label className="text-[13px]">Already have an account?</Label>
                <Link
                  className="text-[13px] text-primary font-semibold self-end"
                  to="/signin"
                >
                  Sign In
                </Link>
              </div>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </AuthenLayout>
  )
}
