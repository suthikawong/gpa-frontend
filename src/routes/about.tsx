import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: RouteComponent,
  beforeLoad: ({ context, location }) => {
    if (!context.user?.id) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      })
    }
  },
})

function RouteComponent() {
  return <div className="text-red-800 font-bold">Hello "/about"!</div>
}
