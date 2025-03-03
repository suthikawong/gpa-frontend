import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <div>
        <div className="text-lg text-astronaut-900">hello</div>
      </div>
    </>
  )
}
