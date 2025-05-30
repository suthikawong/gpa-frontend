import { cn } from '@/lib/utils'
import React from 'react'
import Menu from '../Menu'

interface IDashboardLayout extends React.PropsWithChildren {
  className?: string
}

const DashboardLayout = ({ className, children }: IDashboardLayout) => {
  return (
    <div className="flex flex-col flex-grow w-full">
      <Menu />
      <div className={cn('p-4 w-full flex flex-col flex-grow md:p-8 lg:px-20 xl:px-40 2xl:px-66', className)}>
        {children}
      </div>
    </div>
  )
}

export default DashboardLayout
