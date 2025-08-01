import { cn } from '@/lib/utils'
import React from 'react'

interface EmptyStateProps {
  title: string
  description1?: string
  description2?: string
  icon?: React.ReactNode
  className?: string
  action?: React.ReactNode
}

const EmptyState = ({ title, description1, description2, icon, action, className = '' }: EmptyStateProps) => {
  return (
    <div className={cn('flex flex-col items-center', className)}>
      {icon}
      <div className="text-lg mb-1 md:text-2xl md:mb-2 font-semibold">{title}</div>
      <div className="text-sm text-center text-muted-foreground">{description1}</div>
      <div className="text-sm mb-4 text-center text-muted-foreground">{description2}</div>
      {action}
    </div>
  )
}

export default EmptyState
