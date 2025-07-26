import { api } from '@/api'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { Assessment } from 'gpa-backend/src/drizzle/schema'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { ErrorResponse } from '../../../../gpa-backend/src/app.response'
import toast from '../toast'

interface AssessmentDialogProps {
  triggerButton: React.ReactNode
  data?: Omit<Assessment, 'modelId' | 'modelConfig'>
}

const formSchema = z.object({
  assessmentName: z.string().min(1, { message: 'Please enter the assessment name.' }),
  isPublished: z.boolean().optional(),
})

const AssessmentDialog = ({ triggerButton, data }: AssessmentDialogProps) => {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const defaultValues = {
    assessmentName: data?.assessmentName ?? '',
    isPublished: data?.isPublished,
  }
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  const createMutation = useMutation({
    mutationFn: api.assessment.createAssessment,
    onSuccess: () => {
      setOpen(false)
      toast.success('Assessment created successfully')
      queryClient.invalidateQueries({ queryKey: ['getAssessmentsByInstructor'] })
      form.reset()
    },
    onError: () => {
      toast.error('Failed to create assessment.')
    },
  })

  const updateMutation = useMutation({
    mutationFn: api.assessment.updateAssessment,
    onSuccess: () => {
      setOpen(false)
      toast.success('Assessment updated successfully')
      queryClient.invalidateQueries({ queryKey: ['getAssessmentById', data?.assessmentId] })
      form.reset()
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      if (error.response?.status === 400 || error.response?.status === 404) {
        toast.error(error.response?.data?.message)
      } else {
        toast.error('Failed to update assessment.')
      }
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (data?.assessmentId) {
      updateMutation.mutate({
        assessmentId: data.assessmentId,
        assessmentName: values.assessmentName,
        isPublished: values?.isPublished ?? false,
      })
    } else {
      createMutation.mutate(values)
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
              <DialogTitle className="text-2xl">{data ? 'Edit ' : 'Create '}assessment</DialogTitle>
            </DialogHeader>

            <div className="grid w-full items-center gap-4">
              <FormField
                control={form.control}
                name="assessmentName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assessment Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter assessment name"
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
                        <FormLabel className="text-base">Published</FormLabel>
                        <FormDescription>Enable this assessment for student access.</FormDescription>
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

export default AssessmentDialog
