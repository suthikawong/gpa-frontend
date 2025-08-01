import { cn } from '@/lib/utils'
import { CheckIcon, ClipboardIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

export interface CopyButtonProps {
  value: string
  className?: string
  size?: number
}

const CopyButton = ({ value, className, size = 12 }: CopyButtonProps) => {
  const [hasCopied, setHasCopied] = useState(false)

  useEffect(() => {
    setTimeout(() => {
      setHasCopied(false)
    }, 3000)
  }, [hasCopied])

  const copyToClipboard = async (value: string) => {
    navigator.clipboard.writeText(value)
  }

  return (
    <div
      className={cn('h-fit w-fit', className)}
      onClick={() => {
        copyToClipboard(value)
        setHasCopied(true)
      }}
    >
      {hasCopied ? <CheckIcon size={size} /> : <ClipboardIcon size={size} />}
    </div>
  )
}

export default CopyButton
