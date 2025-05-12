import { ReactNode } from 'react'
import { api } from '@/api'
import { useAuth } from '@/hooks/auth'

interface AuthProviderProps {
  children?: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { user, setUser } = useAuth()
  if (!user) {
    api.user.getLoggedInUser().then((res) => {
      setUser(res.data)
    })
  }
  return children
}
