import { api } from '@/api'
import sandGlass from '@/assets/sandglass.png'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import toast from '../../common/toast'

interface JoinAssessmentDialogProps {
  triggerButton: React.ReactNode
}

const formSchema = z.object({
  assessmentCode: z.string().min(1, { message: 'Please enter the assessment code.' }),
})

const JoinAssessmentDialog = ({ triggerButton }: JoinAssessmentDialogProps) => {
  const [open, setOpen] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    return () => {
      if (!open) {
        setSuccess(false)
      }
    }
  }, [open])

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>
        <div onClick={() => setOpen(true)}>{triggerButton}</div>
      </DialogTrigger>
      <DialogContent>
        {success ? (
          <PendingConfimed setOpen={setOpen} />
        ) : (
          <JoinAssessmentForm
            open={open}
            setSuccess={setSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

export default JoinAssessmentDialog

const PendingConfimed = ({ setOpen }: { setOpen: React.Dispatch<React.SetStateAction<boolean>> }) => {
  return (
    <div>
      <DialogHeader>
        <DialogTitle className="text-2xl">Join assessment</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-8 items-center justify-center my-8">
        <img
          src={sandGlass}
          alt="sandglass image"
        />
        <div className="flex flex-col gap-2 items-center justify-center">
          <h4 className="text-2xl font-semibold">Waiting for confirmation</h4>
          <div className="text-muted-foreground text-center">
            Your request has been sent to the teacher. Please waiting for your request to be accepted.
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button
          type="submit"
          onClick={() => setOpen(false)}
        >
          Okay
        </Button>
      </DialogFooter>
    </div>
  )
}

const JoinAssessmentForm = ({
  open,
  setSuccess,
}: {
  open: boolean
  setSuccess: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  const queryClient = useQueryClient()
  const defaultValues = {
    assessmentCode: '',
  }
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  const joinMutation = useMutation({
    mutationFn: api.assessment.studentJoinAssessment,
    onSuccess: () => {
      setSuccess(true)
      toast.success('Join assessment successfully')
      queryClient.invalidateQueries({ queryKey: ['getAssessmentsByStudent'] })
      form.reset()
    },
    onError: (error: AxiosError) => {
      if (error.response?.status === 404) {
        form.setError('assessmentCode', {
          type: 'manual',
          message: 'Assessment not found with provided code',
        })
      } else {
        toast.error('Failed to join assessment. Please try again.')
      }
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    joinMutation.mutate(values)
  }

  useEffect(() => {
    if (open) form.reset(defaultValues)
  }, [open, form])

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl">Join assessment</DialogTitle>
        </DialogHeader>

        <div className="grid w-full items-center gap-4">
          <FormField
            control={form.control}
            name="assessmentCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assessment Code</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter assessment code"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <DialogFooter>
          <Button
            type="submit"
            loading={joinMutation.isPending}
          >
            Join
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}
