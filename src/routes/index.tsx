import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { api } from '../api'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: res, isLoading, error } = useQuery({ queryKey: ['cats'], queryFn: api.cat.getCats })

  // if (isLoading) return <p>Loading...</p>

  // if (error) return <p>Error occured: {error.message}</p>

  return (
    <>
      <div>
        <Button>Login</Button>
        <div className="text-lg text-astronaut-900">hello</div>
        {isLoading && <p>Loading...</p>}
        {error && <p>Error occured: {error.message}</p>}
        {res?.data?.map((cat, index) => <p key={index}>{cat.name}</p>)}
      </div>
    </>
  )
}
