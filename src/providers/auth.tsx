import { api } from '@/api'
import SuspenseArea from '@/components/common/SuspenseArea'
import { useAuth } from '@/hooks/auth'
import { ReactNode, useState } from 'react'

interface AuthProviderProps {
  children?: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { user, setUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [fetched, setFetched] = useState(false)

  if (!user && !fetched) {
    setFetched(true)
    setLoading(true)
    api.user
      .getLoggedInUser()
      .then((res) => {
        setUser(res.data)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <SuspenseArea
      loading={loading}
      className="items-center"
    >
      {children}
    </SuspenseArea>
  )
}
