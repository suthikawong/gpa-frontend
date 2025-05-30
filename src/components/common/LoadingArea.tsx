import { Loader2 } from 'lucide-react'
import { PropsWithChildren } from 'react'

interface ISuspenseArea extends PropsWithChildren {
  loading: boolean
}

const SuspenseArea = ({ loading, children }: ISuspenseArea) => {
  if (loading) {
    return (
      <div className="w-full h-full flex justify-center">
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
