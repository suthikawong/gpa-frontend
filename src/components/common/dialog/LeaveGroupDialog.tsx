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
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Group } from 'gpa-backend/src/drizzle/schema'
import { useState } from 'react'
import toast from '../toast'

interface LeaveGroupDialogProps {
  triggerButton: React.ReactNode
  groupId: Group['groupId']
}

const LeaveGroupDialog = ({ triggerButton, groupId }: LeaveGroupDialogProps) => {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const leaveMutation = useMutation({
    mutationFn: api.group.leaveGroup,
    onSuccess: () => {
      setOpen(false)
      toast.success('Leave group successfully')
      queryClient.invalidateQueries({ queryKey: ['getJoinedGroup'] })
    },
    onError: () => {
      toast.error('Failed to leave group. Please try again.')
    },
  })

  const onSubmit = async () => {
    leaveMutation.mutate({ groupId })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>
        <div onClick={() => setOpen(true)}>{triggerButton}</div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl">Leave group</DialogTitle>
        </DialogHeader>
        <DialogDescription>Are you sure you want to leave this group?</DialogDescription>
        <DialogFooter>
          <Button
            variant="destructiveOutline"
            type="button"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="destructive"
            loading={leaveMutation.isPending}
            onClick={onSubmit}
          >
            Leave
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default LeaveGroupDialog
