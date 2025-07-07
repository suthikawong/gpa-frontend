import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { PeerRatingItem, UserWithPeerRating } from 'gpa-backend/src/peer-rating/dto/peer-rating.response'
import { useState } from 'react'

interface PeerRatingDialogProps {
  triggerButton: React.ReactNode
  data: PeerRatingItem
  ratee: UserWithPeerRating
  rater: UserWithPeerRating | undefined
}

const PeerRatingDialog = ({ triggerButton, data, ratee, rater }: PeerRatingDialogProps) => {
  const [open, setOpen] = useState(false)

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>
        <div onClick={() => setOpen(true)}>{triggerButton}</div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg!">
        <DialogHeader>
          <DialogTitle className="text-2xl">Score & Feedback</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div>
            <DialogDescription>Ratee</DialogDescription>
            <div className="font-semibold">{ratee?.name ?? '-'}</div>
          </div>
          <div className="flex gap-4 items-end">
            <div>
              <DialogDescription>Rater</DialogDescription>
              <div className="font-semibold">{rater?.name ?? '-'}</div>
            </div>
            {ratee.userId === rater?.userId && (
              <Badge
                variant="secondary"
                className="rounded-sm h-fit"
                asChild
              >
                <div>Self-rating</div>
              </Badge>
            )}
          </div>
          <div>
            <DialogDescription>Score</DialogDescription>
            <div className="font-semibold">{data?.score || '-'}</div>
          </div>
          <div>
            <DialogDescription>Comment</DialogDescription>
            <div className="font-semibold">{data?.comment || '-'}</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default PeerRatingDialog
