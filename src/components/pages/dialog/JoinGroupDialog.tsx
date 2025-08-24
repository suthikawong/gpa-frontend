import { api } from '@/api'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { Assessment } from 'gpa-backend/src/drizzle/schema'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import toast from '../../common/toast'

interface JoinGroupDialogProps {
  triggerButton: React.ReactNode
  assessmentId: Assessment['assessmentId']
}

const formSchema = z.object({
  groupCode: z.string().min(1, { message: 'Please enter the group code.' }),
})

const JoinGroupDialog = ({ triggerButton, assessmentId }: JoinGroupDialogProps) => {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const defaultValues = {
    groupCode: '',
  }
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  const joinMutation = useMutation({
    mutationFn: api.group.joinGroup,
    onSuccess: () => {
      setOpen(false)
      toast.success('Join group successfully')
      queryClient.invalidateQueries({ queryKey: ['getJoinedGroup', assessmentId] })
      form.reset()
    },
    onError: (error: AxiosError) => {
      if (error.response?.status === 400) {
        form.setError('groupCode', {
          type: 'manual',
          message: 'No group code found.',
        })
      } else {
        toast.error('Failed to join group. Please try again.')
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
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <DialogHeader>
              <DialogTitle className="text-2xl">Join group</DialogTitle>
            </DialogHeader>

            <div className="grid w-full items-center gap-4">
              <FormField
                control={form.control}
                name="groupCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group Code</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter group code"
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
      </DialogContent>
    </Dialog>
  )
}

export default JoinGroupDialog
