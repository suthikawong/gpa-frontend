import React from 'react'
import Menu from '../Menu'

interface IDashboardLayout extends React.PropsWithChildren {}

const DashboardLayout = ({ children }: IDashboardLayout) => {
  return (
    <div className="w-full">
      <Menu />
      {children}
    </div>
  )
}

export default DashboardLayout
