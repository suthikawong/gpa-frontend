import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import Menu from '../components/Menu'

export const Route = createRootRoute({
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
