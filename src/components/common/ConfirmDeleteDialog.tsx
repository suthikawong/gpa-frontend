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
  dialogType?: 'delete' | 'info'
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
  confirmButtonText?: string
}

const ConfirmDeleteDialog = <T,>({
  dialogType = 'delete',
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
  confirmButtonText,
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
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent className={className}>
        <DialogHeader>
          <DialogTitle className="text-2xl">{title}</DialogTitle>
          <DialogDescription className="hidden">Description</DialogDescription>
        </DialogHeader>
        <div className="text-sm text-muted-foreground">
          {content ?? 'Are you sure you want to delete this? This action cannot be undone.'}
        </div>
        <DialogFooter>
          <Button
            variant={dialogType === 'delete' ? 'destructiveOutline' : 'outline'}
            onClick={() => setOpen(false)}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant={dialogType === 'delete' ? 'destructive' : 'default'}
            onClick={() => mutation.mutate()}
            loading={mutation.isPending}
          >
            {(confirmButtonText ?? dialogType === 'delete') ? 'Delete' : 'Continue'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ConfirmDeleteDialog
