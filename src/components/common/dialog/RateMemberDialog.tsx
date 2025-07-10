import { api } from '@/api'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { Model, ScoringComponent } from 'gpa-backend/src/drizzle/schema'
import { UserProtected } from 'gpa-backend/src/user/user.interface'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import toast from '../toast'

interface RateMemberDialogProps {
  triggerButton: React.ReactNode
  data: UserProtected[]
  scoringComponentId: ScoringComponent['scoringComponentId']
  model: Model
}

const formSchema = z.object({
  score: z.number(),
  comment: z.string().optional(),
})

const RateMemberDialog = ({ triggerButton, data, scoringComponentId, model }: RateMemberDialogProps) => {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const defaultValues = {
    score: 50,
    comment: '',
  }
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  const mutation = useMutation({
    mutationFn: api.peerRating.ratePeer,
    onSuccess: () => {
      setOpen(false)
      toast.success('Student was rated successfully')
      // queryClient.invalidateQueries({ queryKey: ['getJoinedGroup', assessmentId] })
      form.reset()
    },
    onError: (error: AxiosError) => {
      if (error.response?.status === 400) {
        form.setError('comment', {
          type: 'manual',
          message: 'No group code found.',
        })
      } else {
        toast.error('Failed to rate this student. Please try again.')
      }
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log('TLOG ~ values:', values)
    // mutation.mutate({ ...values, scoringComponentId, rateeStudentUserId: data.userId })
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
              <DialogTitle className="text-2xl">Rate </DialogTitle>
            </DialogHeader>
            <div className="grid w-full items-center gap-4">
              <FormField
                control={form.control}
                name="score"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Score</FormLabel>
                    <FormControl>
                      <ScoreSlider defaultValue={defaultValues.score} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comment</FormLabel>
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
                type="submit"
                loading={mutation.isPending}
              >
                Confirm Rating
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

const ScoreSlider = ({ defaultValue }: { defaultValue: number }) => {
  return (
    <Slider
      defaultValue={[defaultValue]}
      max={100}
      step={1}
    />
  )
}

export default RateMemberDialog
