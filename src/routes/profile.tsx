import { api } from '@/api'
import toast from '@/components/common/toast'
import Uploader, { FileTypes } from '@/components/common/Uploader'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Roles } from '@/config/app'
import { useAuth } from '@/hooks/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
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
  userNumber: z.string().optional(),
})

function RouteComponent() {
  const { user, setUser } = useAuth()
  const [files, setFiles] = useState<File[]>([])
  const [preview, setPreview] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      userNumber: user?.userNumber ?? undefined,
    },
  })

  const mutation = useMutation({
    mutationFn: api.user.updateProfile,
    onSuccess: (res) => {
      const user = res.data ?? null
      setUser(user)
      toast.success('Successfully update profile.')
    },
    onError: () => {
      toast.error('Something went wrong. Please try again.')
    },
  })

  useEffect(() => {
    if (user?.image) setPreview(user.image)
  }, [])

  useEffect(() => {
    if (files.length > 0) {
      if (preview) URL.revokeObjectURL(preview)
      const url = URL.createObjectURL(files[0])
      setPreview(url)
    }
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [files])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const formData = new FormData()
    formData.append('userId', user?.userId.toString()!)
    formData.append('name', values.name)
    if (values.userNumber) {
      formData.append('userNumber', values.userNumber)
    }
    if (files.length > 0) {
      formData.append('file', files[0])
    }
    mutation.mutate(formData)
  }

  const onRemoveImage = () => {
    setFiles([])
    if (preview) URL.revokeObjectURL(preview)
    setPreview(null)
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
                {/* <div className="bg-primary rounded-xl flex justify-center items-center text-white text-5xl w-30 h-30 m-auto mt-10 mb-16">
                  {user?.name?.[0] ?? ''}
                </div> */}
                <div className="flex flex-col items-center m-auto mt-4 mb-8 ">
                  {preview ? (
                    <div className="flex flex-col items-center">
                      {/* <div className="bg-primary rounded-xl flex justify-center items-center text-white text-5xl w-[160px] h-[160px]">
                        {user?.name?.[0] ?? ''}
                      </div> */}
                      <div className="w-[168px] h-[168px] rounded-xl">
                        <img
                          src={preview}
                          alt="profile image"
                          className="w-full h-full object-cover rounded-xl"
                        />
                      </div>
                      <Button
                        size="sm"
                        variant="link"
                        className="text-destructive"
                        onClick={onRemoveImage}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <Uploader
                      files={files}
                      setFiles={setFiles}
                      allowFileTypes={[FileTypes.JPEG, FileTypes.PNG]}
                      className="max-w-[200px] h-[200px]"
                      showUploadedFiles={false}
                    />
                  )}
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
                  {user?.roleId === Roles.Student && (
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
                  )}
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
