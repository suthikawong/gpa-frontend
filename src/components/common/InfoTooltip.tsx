import { Info } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'

interface InfoTooltipProps {
  content: string | React.ReactNode
}

const InfoTooltip = ({ content }: InfoTooltipProps) => {
  return (
    <Tooltip>
      <TooltipTrigger onClick={(e) => e.preventDefault()}>
        <Info
          size={14}
          className="text-muted-foreground"
        />
      </TooltipTrigger>
      <TooltipContent className="bg-foreground text-white [&>span>svg]:bg-foreground [&>span>svg]:fill-foreground max-w-[600px]">
        {content}
      </TooltipContent>
    </Tooltip>
  )
}

export default InfoTooltip
