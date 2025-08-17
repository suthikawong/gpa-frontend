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
import { useState } from 'react'

interface AlertDialogProps {
  dialogType?: 'danger' | 'info'
  triggerButton: React.ReactNode
  title: string
  content?: React.ReactNode
  onConfirm?: () => void
  onCancel?: () => void
  beforeOpen?: () => Promise<boolean>
  className?: string
  confirmButtonText?: string
  showCancelButton?: boolean
}

const AlertDialog = ({
  dialogType = 'info',
  triggerButton,
  title,
  content,
  onConfirm,
  onCancel,
  beforeOpen,
  className,
  confirmButtonText,
  showCancelButton = true,
}: AlertDialogProps) => {
  const [open, setOpen] = useState(false)

  const onClickCancel = () => {
    setOpen(false)
    onCancel?.()
  }

  const onClickConfirm = () => {
    setOpen(false)
    onConfirm?.()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={async (value) => {
        const valid = await beforeOpen?.()
        if (valid) setOpen(value)
      }}
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
          {showCancelButton && (
            <Button
              variant={dialogType === 'danger' ? 'destructiveOutline' : 'outline'}
              onClick={onClickCancel}
            >
              Cancel
            </Button>
          )}
          <Button
            variant={dialogType === 'danger' ? 'destructive' : 'default'}
            onClick={onClickConfirm}
          >
            {confirmButtonText ?? 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AlertDialog
