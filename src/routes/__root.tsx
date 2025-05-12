import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { UserProtected } from 'gpa-backend/src/user/user.interface'
import Menu from '../components/Menu'

interface AppRouterContext {
  user: UserProtected
}

export const Route = createRootRouteWithContext<AppRouterContext>()({
  component: () => (
    <div className="flex-grow flex-row flex bg-zircon-50">
      <Menu />
      <div className="flex-grow">
        <Outlet />
      </div>
      <TanStackRouterDevtools />
    </div>
  ),
})
