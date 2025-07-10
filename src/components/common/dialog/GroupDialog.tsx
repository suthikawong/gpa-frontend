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
import { useRouter } from '@tanstack/react-router'
import { GetGroupByIdResponse } from 'gpa-backend/src/group/dto/group.response'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import toast from '../toast'

interface GroupDialogProps {
  triggerButton: React.ReactNode
  data?: GetGroupByIdResponse
}

const formSchema = z.object({
  groupName: z.string().min(1, { message: 'Please enter the group name.' }),
})

const GroupDialog = ({ triggerButton, data }: GroupDialogProps) => {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const route = useRouter()
  const params: any = route.routeTree.useParams()
  const assignmentId = parseInt(params?.assignmentId!)
  const defaultValues = {
    groupName: data?.groupName ?? '',
  }
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  const createMutation = useMutation({
    mutationFn: api.group.createGroup,
    onSuccess: () => {
      setOpen(false)
      toast.success('Group created successfully')
      queryClient.invalidateQueries({ queryKey: ['getGroupsByAssignmentId'] })
      form.reset()
    },
    onError: () => {
      toast.error('Failed to create group.')
    },
  })

  const updateMutation = useMutation({
    mutationFn: api.group.updateGroup,
    onSuccess: () => {
      setOpen(false)
      toast.success('Group updated successfully')
      queryClient.invalidateQueries({ queryKey: ['getGroupById', data?.groupId] })
      form.reset()
    },
    onError: () => {
      toast.error('Failed to update group.')
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (data?.groupId) {
      updateMutation.mutate({
        groupId: data.groupId,
        groupName: values.groupName,
      })
    } else {
      createMutation.mutate({
        assignmentId: assignmentId,
        groupName: values.groupName,
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
              <DialogTitle className="text-2xl">{data ? 'Edit ' : 'Create '}group</DialogTitle>
              <DialogDescription>
                Enter group details. Click {data ? 'save' : 'create'} when you're done.
              </DialogDescription>
            </DialogHeader>

            <div className="grid w-full items-center gap-4">
              <FormField
                control={form.control}
                name="groupName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter group name"
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

export default GroupDialog
