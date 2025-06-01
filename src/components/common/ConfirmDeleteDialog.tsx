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
import { useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import toast from './toast'

interface ConfirmDeleteDialogProps<T> {
  triggerButton: React.ReactNode
  data: T
  api: (data: T) => Promise<any>
  title: string
  content?: React.ReactNode
  onSuccessMessage: string
  onErrorMessage: string
  refetchKeys?: string[]
  redirectTo?: string
}

const ConfirmDeleteDialog = <T,>({
  triggerButton,
  data,
  api,
  title,
  content,
  onSuccessMessage,
  onErrorMessage,
  refetchKeys = [],
  redirectTo,
}: ConfirmDeleteDialogProps<T>) => {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const router = useRouter()

  const mutation = useMutation({
    mutationFn: () => api(data),
    onSuccess: () => {
      toast.success(onSuccessMessage)
      setOpen(false)
      refetchKeys.forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }))
      if (redirectTo) {
        router.history.push(redirectTo)
      }
    },
    onError: () => {
      toast.error(onErrorMessage)
    },
  })

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>
        <div onClick={() => setOpen(true)}>{triggerButton}</div>
      </DialogTrigger>
      <DialogContent className="!max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">{title}</DialogTitle>
          <DialogDescription>
            {content ?? 'This action cannot be undone. This will permanently delete the selected item.'}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="destructiveOutline"
            onClick={() => setOpen(false)}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => mutation.mutate()}
            loading={mutation.isPending}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ConfirmDeleteDialog
