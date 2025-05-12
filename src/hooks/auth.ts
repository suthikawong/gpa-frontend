import { UserProtected } from 'gpa-backend/src/user/user.interface'
import { create } from 'zustand'

export type AuthState = {
  user: UserProtected | undefined
  setUser: (user: UserProtected | undefined) => void
}

export const useAuth = create<AuthState>((set) => ({
  user: undefined,
  setUser: (user) => set({ user }),
}))
