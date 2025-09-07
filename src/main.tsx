import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import NotFound from './components/pages/NotFound.tsx'
import { useAuth } from './hooks/auth'
import { AuthProvider } from './providers/auth.tsx'
import { routeTree } from './routeTree.gen'

const router = createRouter({
  routeTree,
  context: {
    user: undefined!,
  },
  defaultNotFoundComponent: () => <NotFound />,
  scrollRestoration: true,
  defaultHashScrollIntoView: { behavior: 'smooth' },
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const client = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
})

const App = () => {
  const { user } = useAuth()
  return (
    <QueryClientProvider client={client}>
      <AuthProvider>
        <RouterProvider
          router={router}
          context={{ user }}
        />
      </AuthProvider>
    </QueryClientProvider>
  )
}

const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  )
}
