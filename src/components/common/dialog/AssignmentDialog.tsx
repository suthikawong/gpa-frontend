import { api } from '@/api'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { GetAssignmentByIdResponse } from 'gpa-backend/src/assignment/dto/assignment.response'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import toast from '../toast'

interface AssignmentDialogProps {
  triggerButton: React.ReactNode
  data?: GetAssignmentByIdResponse
}

const formSchema = z.object({
  assignmentName: z.string().min(1, { message: 'Please enter the assignment name.' }),
  dueDate: z.date({
    required_error: 'Please select a due date.',
  }),
  isPublished: z.boolean().optional(),
})

const AssignmentDialog = ({ triggerButton, data }: AssignmentDialogProps) => {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const route = useRouter()
  const params: any = route.routeTree.useParams()
  const classroomId = parseInt(params?.classroomId!)

  const defaultValues = {
    assignmentName: data?.assignmentName ?? '',
    dueDate: data?.dueDate ? new Date(data.dueDate) : undefined,
    isPublished: data?.isPublished,
  }
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  const createMutation = useMutation({
    mutationFn: api.assignment.createAssignment,
    onSuccess: () => {
      setOpen(false)
      toast.success('Assignment created successfully')
      queryClient.invalidateQueries({ queryKey: ['getAssignmentByClassroomId', classroomId] })
      form.reset()
    },
    onError: () => {
      toast.error('Failed to create assignment.')
    },
  })

  const updateMutation = useMutation({
    mutationFn: api.assignment.updateAssignment,
    onSuccess: () => {
      setOpen(false)
      toast.success('Assignment updated successfully')
      queryClient.invalidateQueries({ queryKey: ['getAssignmentById', data?.assignmentId] })
      form.reset()
    },
    onError: (error: any) => {
      if (error?.status == 400) {
        toast.error(error.response?.data?.message)
      } else {
        toast.error('Failed to update assignment.')
      }
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (data?.assignmentId) {
      updateMutation.mutate({
        assignmentId: data.assignmentId,
        assignmentName: values.assignmentName,
        dueDate: values.dueDate.toISOString(),
        isPublished: values.isPublished ?? false,
        classroomId: data.classroomId,
      })
    } else {
      createMutation.mutate({ ...values, dueDate: values.dueDate.toISOString(), classroomId })
    }
  }

  useEffect(() => {
    if (open) form.reset(defaultValues)
  }, [open, data, form])

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
              <DialogTitle className="text-2xl">{data ? 'Edit ' : 'Create '}assignment</DialogTitle>
              <DialogDescription>
                Enter classroom details. Click {data ? 'save' : 'create'} when you're done.
              </DialogDescription>
            </DialogHeader>

            <div className="grid w-full items-center gap-4">
              <FormField
                control={form.control}
                name="assignmentName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assignment Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter assignment name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field, fieldState }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <DatePicker
                        field={field}
                        isInvalid={fieldState.invalid}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {data && (
                <FormField
                  control={form.control}
                  name="isPublished"
                  render={({ field }) => (
                    <FormItem className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Publish</FormLabel>
                        <FormDescription>Publish this assignment for student access.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value ?? false}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
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
                loading={createMutation.isPending || updateMutation.isPending}
              >
                {data ? 'Save' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default AssignmentDialog
