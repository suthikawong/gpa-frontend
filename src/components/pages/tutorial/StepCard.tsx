import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Image } from 'lucide-react'

const StepCard = ({
  step,
  title,
  description,
  image,
}: {
  step: number
  title: string
  description: string | React.ReactNode
  image: string
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:space-x-8">
      <StepCircle step={step} />
      <div className="flex flex-col items-center space-y-8 flex-grow">
        <div className="p-6 bg-secondary/80 rounded-2xl space-y-2 w-full">
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-semibold text-lg">{title}</h3>
          </div>
          <div className="text-foreground/80 text-sm">{description}</div>
          <div className="flex justify-end">
            <ImageDialog
              title={title}
              image={image}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default StepCard

const StepCircle = ({ step }: { step: number }) => {
  return (
    <div className="flex flex-col items-center gap-2 my-auto mb-4 sm:mb-auto">
      <div className="flex items-center justify-center size-16 rounded-full bg-primary/90 text-primary-foreground text-3xl font-semibold">
        {step}
      </div>
      <div className="font-semibold text-muted-foreground">Step {step}</div>
    </div>
  )
}

const ImageDialog = ({ title, image }: { title: string; image: string }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="icon"
          className="rounded-full"
        >
          <Image />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full! sm:max-w-2xl! md:max-w-3xl! lg:max-w-5xl!">
        <DialogHeader>
          <DialogTitle className="text-2xl">{title}</DialogTitle>
          <DialogDescription className="hidden">{title}</DialogDescription>
        </DialogHeader>
        <img
          src={image}
          alt="step image"
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button>Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
