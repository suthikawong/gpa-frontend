import DashboardLayout from '@/components/layouts/DashboardLayout'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/instructor/my-classroom')({
  component: RouteComponent,
  beforeLoad: ({ context, location }) => {
    if (!context.user?.userId) {
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
  return (
    <DashboardLayout>
      <div className="text-lg font-semibold">My Classroom</div>
    </DashboardLayout>
  )
}
