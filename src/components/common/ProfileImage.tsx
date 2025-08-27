import { useAuth } from '@/hooks/auth'
import { memo } from 'react'
import { AvatarFallback, AvatarImage } from '../ui/avatar'

const ProfileImage = () => {
  const user = useAuth((state) => state.user)

  if (!user) return null

  return (
    <>
      <AvatarImage
        src={user?.image ?? undefined}
        className="object-cover"
        loading="eager"
      />
      <AvatarFallback>{user?.name?.[0] ?? ''}</AvatarFallback>
    </>
  )
}

export default memo(ProfileImage)
