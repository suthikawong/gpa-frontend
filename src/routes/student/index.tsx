import DashboardLayout from '@/components/layouts/DashboardLayout'
import { useAuth } from '@/hooks/auth'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/student/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { user } = useAuth()
  return (
    <DashboardLayout className="gap-4">
      <div>Hello "/student/"!</div>
      <div>Name: {user?.name ?? '-'}</div>
      <div>Email: {user?.email ?? '-'}</div>
    </DashboardLayout>
  )
}
