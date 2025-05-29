import React from 'react'

interface IAuthenLayout extends React.PropsWithChildren {}

const AuthenLayout = ({ children }: IAuthenLayout) => {
  return <div className="flex flex-grow justify-center items-center">{children}</div>
}

export default AuthenLayout
