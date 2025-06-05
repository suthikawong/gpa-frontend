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
import { cn } from '@/lib/utils'
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
  refetchKeys?: (string | number)[]
  redirectTo?: string
  callback?: () => void
  className?: string
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
  callback,
  className,
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
      callback?.()
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
      <DialogContent className={cn('sm:!max-w-[500px]', className)}>
        <DialogHeader>
          <DialogTitle className="text-2xl">{title}</DialogTitle>
          <DialogDescription className="hidden">
            Are you sure you want to delete this? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="text-sm text-muted-foreground">
          {content ?? 'Are you sure you want to delete this? This action cannot be undone.'}
        </div>
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
