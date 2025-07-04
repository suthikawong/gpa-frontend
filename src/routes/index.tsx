import { Roles } from '@/config'
import { createFileRoute, redirect } from '@tanstack/react-router'

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
  return null
}
