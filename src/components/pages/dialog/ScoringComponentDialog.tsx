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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { AxiosError } from 'axios'
import { startOfDay } from 'date-fns'
import { GetScoringComponentByIdResponse } from 'gpa-backend/src/scoring-component/dto/scoring-component.response'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import toast from '../../common/toast'
import { ComponentWeightTooltip } from '../tooltip/ModelTooltips'

interface ScoringComponentDialogProps {
  triggerButton: React.ReactNode
  data?: GetScoringComponentByIdResponse
}

const formSchema = z
  .object({
    startDate: z.date({
      required_error: 'Please select a start date.',
    }),
    endDate: z.date({
      required_error: 'Please select a end date.',
    }),
    weight: z
      .number({ required_error: 'Please enter a weight', invalid_type_error: 'Weight must be a number' })
      .int()
      .gt(0, { message: 'Weight must be greater than 0' }),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: 'End date must be after start date',
    path: ['endDate'],
  })

const ScoringComponentDialog = ({ triggerButton, data }: ScoringComponentDialogProps) => {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const route = useRouter()
  const params: any = route.routeTree.useParams()
  const assessmentId = parseInt(params?.assessmentId!)
  const now = new Date()
  const defaultValues = {
    startDate: data?.startDate ? new Date(data.startDate) : undefined,
    endDate: data?.endDate ? new Date(data.endDate) : undefined,
    weight: 1,
  }
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  const createMutation = useMutation({
    mutationFn: api.scoringComponent.createScoringComponent,
    onSuccess: () => {
      setOpen(false)
      toast.success('Scoring component created successfully')
      queryClient.invalidateQueries({ queryKey: ['getScoringComponentsByAssessmentId', assessmentId] })
      queryClient.invalidateQueries({ queryKey: ['getAssessmentById', assessmentId] })
      form.reset()
    },
    onError: (error: AxiosError) => {
      if (error.response?.status === 400) {
        form.setError('startDate', {
          type: 'manual',
          message: 'The scoring component dates overlap with existing components',
        })
        form.setError('endDate', {
          type: 'manual',
          message: 'The scoring component dates overlap with existing components',
        })
      } else {
        toast.error('Failed to create scoring component.')
      }
    },
  })

  const updateMutation = useMutation({
    mutationFn: api.scoringComponent.updateScoringComponent,
    onSuccess: () => {
      setOpen(false)
      toast.success('Scoring component updated successfully')
      queryClient.invalidateQueries({ queryKey: ['getScoringComponentsByAssessmentId', assessmentId] })
      form.reset()
    },
    onError: (error: AxiosError) => {
      if (error.response?.status === 400) {
        form.setError('startDate', {
          type: 'manual',
          message: 'The scoring component dates overlap with existing components',
        })
        form.setError('endDate', {
          type: 'manual',
          message: 'The scoring component dates overlap with existing components',
        })
      } else {
        toast.error('Failed to update scoring component.')
      }
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (data?.scoringComponentId) {
      updateMutation.mutate({
        scoringComponentId: data.scoringComponentId,
        startDate: values.startDate,
        endDate: values.endDate,
        weight: values.weight,
      })
    } else {
      createMutation.mutate({
        assessmentId: assessmentId,
        startDate: values.startDate,
        endDate: values.endDate,
        weight: values.weight,
      })
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
              <DialogTitle className="text-2xl">{data ? 'Edit ' : 'Create '}scoring component</DialogTitle>
              <DialogDescription>
                Enter scoring component details. Click {data ? 'save' : 'create'} when you're done.
              </DialogDescription>
            </DialogHeader>

            <div className="grid w-full items-center gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field, fieldState }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <DatePicker
                        type="datetime"
                        field={field}
                        isInvalid={fieldState.invalid}
                        disabledDates={(date) => date < startOfDay(now)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field, fieldState }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <DatePicker
                        type="datetime"
                        field={field}
                        isInvalid={fieldState.invalid}
                        disabledDates={(date) => date < startOfDay(now)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Weight <ComponentWeightTooltip />
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        type="number"
                        placeholder="Enter scoring component weight"
                      />
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

export default ScoringComponentDialog
