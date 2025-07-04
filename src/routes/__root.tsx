import { Toaster } from '@/components/ui/sonner'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
// import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { UserProtected } from 'gpa-backend/src/user/user.interface'

interface AppRouterContext {
  user: UserProtected
}

export const Route = createRootRouteWithContext<AppRouterContext>()({
  component: () => (
    <div className="flex-grow flex-row flex bg-zircon-50">
      <Outlet />
      <Toaster />
      {/* <TanStackRouterDevtools /> */}
    </div>
  ),
})
