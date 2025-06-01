import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { PropsWithChildren } from 'react'

interface ISuspenseArea extends PropsWithChildren {
  className?: string
  loading: boolean
}

const SuspenseArea = ({ loading, className, children }: ISuspenseArea) => {
  if (loading) {
    return (
      <div className={cn('w-full h-full flex justify-center', className)}>
        <Loader2
          className="animate-spin text-primary mt-8"
          size={60}
        />
      </div>
    )
  }
  return children
}

export default SuspenseArea
