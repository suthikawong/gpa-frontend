import { api } from '@/api'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { Assessment } from 'gpa-backend/src/drizzle/schema'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { ErrorResponse } from '../../../../gpa-backend/src/app.response'
import toast from '../toast'

interface AddStudentDialogProps {
  triggerButton: React.ReactNode
  assessmentId: Assessment['assessmentId']
}

const formSchema = z.object({
  email: z.string().min(1, { message: "Please enter student's email" }).email('This is not a valid email'),
})

const AddStudentDialog = ({ triggerButton, assessmentId }: AddStudentDialogProps) => {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const defaultValues = {
    email: '',
  }
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  const mutation = useMutation({
    mutationFn: api.assessment.addStudentByEmail,
    onSuccess: () => {
      setOpen(false)
      toast.success('Student added successfully')
      queryClient.invalidateQueries({ queryKey: ['searchStudentsInAssessment', assessmentId, 1] })
      form.reset()
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      if (error.response?.status === 400 || error.response?.status === 404) {
        form.setError('email', {
          type: 'manual',
          message: error.response?.data?.message,
        })
      } else {
        toast.error('Failed to add student to assessment.')
      }
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    mutation.mutate({ assessmentId, email: values.email })
  }

  useEffect(() => {
    if (open) form.reset(defaultValues)
  }, [open, form])

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>
        <div onClick={() => setOpen(true)}>{triggerButton}</div>
      </DialogTrigger>
      <DialogContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <DialogHeader>
              <DialogTitle className="text-2xl">Add student</DialogTitle>
              <DialogDescription>Enter the student's email address to add them to this assessment.</DialogDescription>
            </DialogHeader>

            <div className="grid w-full items-center gap-4">
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

            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={mutation.isPending}
              >
                Add Student
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default AddStudentDialog
