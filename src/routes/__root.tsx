import {
  createRootRoute,
  Outlet,
  useNavigate,
  useRouterState,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { useEffect } from 'react'
import { AuthProvider, useAuth } from '#/lib/AuthContext'

export const Route = createRootRoute({
  component: RootDocument,
})

function AuthGuard() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const location = useRouterState({ select: (s) => s.location })
  const isLoginPage = location.pathname === '/login'

  useEffect(() => {
    if (loading) return
    if (!user && !isLoginPage) {
      navigate({ to: '/login' })
    }
  }, [user, loading, isLoginPage, navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
      </div>
    )
  }

  if (!user && !isLoginPage) {
    return null
  }

  return <Outlet />
}

function RootDocument() {
  return (
    <AuthProvider>
      <main className="w-full px-6 py-8">
        <AuthGuard />
      </main>
      <TanStackRouterDevtools position="bottom-right" />
    </AuthProvider>
  )
}
