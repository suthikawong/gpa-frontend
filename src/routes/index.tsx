import DashboardLayout from '@/components/layouts/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Roles } from '@/config'
import { useAuth } from '@/hooks/auth'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { api } from '../api'

export const Route = createFileRoute('/')({
  component: RouteComponent,
  beforeLoad: ({ context, location }) => {
    if (context?.user?.roleId === Roles.Instructor) {
      throw redirect({
        to: '/instructor/my-classrooms',
        search: {
          redirect: location.href,
        },
      })
    } else if (context?.user?.roleId === Roles.Student) {
      // throw redirect({
      //   to: '/student/my-classroom',
      //   search: {
      //     redirect: location.href,
      //   },
      // })
    } else {
      throw redirect({
        to: '/signin',
        search: {
          redirect: location.href,
        },
      })
    }
  },
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
    <DashboardLayout>
      <div>
        {user ? <Button onClick={onClickSignout}>Sign Out</Button> : <Button onClick={onClickSignin}>Sign In</Button>}
        <div className="text-lg text-astronaut-900">Content</div>
        {isLoading && <p>Loading...</p>}
        {error && <p>Error occured: {error.message}</p>}
        {res?.data?.map((cat, index) => <p key={index}>{cat.name}</p>)}
      </div>
    </DashboardLayout>
  )
}
