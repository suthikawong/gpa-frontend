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
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ClassroomWithInstitute } from 'gpa-backend/src/classroom/dto/classroom.response'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import toast from '../toast'

interface ClassroomDialogProps {
  triggerButton: React.ReactNode
  data?: ClassroomWithInstitute
}

const formSchema = z.object({
  classroomName: z.string().min(1, { message: 'Please enter the classroom name.' }),
  instituteId: z.string().min(1, { message: 'Please select an institute.' }),
  isActive: z.boolean().optional(),
})

const ClassroomDialog = ({ triggerButton, data }: ClassroomDialogProps) => {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const defaultValues = {
    classroomName: data?.classroomName ?? '',
    instituteId: data?.instituteId?.toString() ?? '',
    isActive: data?.isActive,
  }
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  const { data: lookup, error } = useQuery({ queryKey: ['getInstitutes'], queryFn: api.lookup.getInstitutes })

  const instituteOptions =
    lookup?.data?.map((item) => ({ id: item.instituteId.toString(), name: item.instituteName })) ?? []

  const createMutation = useMutation({
    mutationFn: api.classroom.createClassroom,
    onSuccess: () => {
      setOpen(false)
      toast.success('Classroom created successfully')
      queryClient.invalidateQueries({ queryKey: ['getInstructorClassrooms'] })
      form.reset()
    },
    onError: () => {
      toast.error('Failed to create classroom.')
    },
  })

  const updateMutation = useMutation({
    mutationFn: api.classroom.updateClassroom,
    onSuccess: () => {
      setOpen(false)
      toast.success('Classroom updated successfully')
      queryClient.invalidateQueries({ queryKey: ['getClassroomById', data?.classroomId] })
      form.reset()
    },
    onError: () => {
      toast.error('Failed to update classroom.')
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (data?.classroomId) {
      updateMutation.mutate({
        classroomId: data.classroomId,
        classroomName: values.classroomName,
        instituteId: parseInt(values.instituteId),
        isActive: values?.isActive ?? false,
      })
    } else {
      createMutation.mutate({ ...values, instituteId: parseInt(values.instituteId) })
    }
  }

  useEffect(() => {
    if (error) {
      toast.error('Something went wrong. Please try again.')
    }
  }, [error])

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
              <DialogTitle className="text-2xl">{data ? 'Edit ' : 'Create '}classroom</DialogTitle>
              <DialogDescription>
                Enter classroom details. Click {data ? 'save' : 'create'} when you're done.
              </DialogDescription>
            </DialogHeader>

            <div className="grid w-full items-center gap-4">
              <FormField
                control={form.control}
                name="classroomName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Classroom Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter classroom name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="instituteId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Institute</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select institute" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {instituteOptions.map((institute) => (
                          <SelectItem
                            key={institute.id}
                            value={institute.id}
                          >
                            {institute.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />
              {data && (
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active</FormLabel>
                        <FormDescription>Enable this classroom for student access.</FormDescription>
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

export default ClassroomDialog
