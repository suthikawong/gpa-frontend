import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/auth'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { api } from '../api'

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { user, setUser } = useAuth()
  const router = useRouter()
  const { data: res, isLoading, error } = useQuery({ queryKey: ['cats'], queryFn: api.cat.getCats })

  const onClickSignout = async () => {
    await api.auth.logout()
    setUser(undefined)
  }

  const onClickSignin = async () => {
    router.history.push('/signin')
  }

  return (
    <>
      <div>
        {user ? <Button onClick={onClickSignout}>Sign Out</Button> : <Button onClick={onClickSignin}>Sign In</Button>}
        <div className="text-lg text-astronaut-900">Content</div>
        {isLoading && <p>Loading...</p>}
        {error && <p>Error occured: {error.message}</p>}
        {res?.data?.map((cat, index) => <p key={index}>{cat.name}</p>)}
      </div>
    </>
  )
}
