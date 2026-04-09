import {
  createRootRoute,
  Outlet,
  useNavigate,
  useRouterState,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { useEffect } from 'react'
import { AuthProvider, useAuth } from '#/lib/AuthContext'
import { signOutUser } from '#/lib/firebase'

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

  const isAllowedDomain = user?.email?.endsWith('@3horizons.com')
  if (user && !isLoginPage && !isAllowedDomain) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-2xl font-semibold text-gray-900">Access Denied</h1>
            <p className="text-sm text-gray-500 text-center">
              This app is restricted to <span className="font-medium text-gray-700">3horizons.com</span> accounts. You are signed in as <span className="font-medium text-gray-700">{user.email}</span>.
            </p>
          </div>
          <button
            onClick={() => signOutUser()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            Sign out and try another account
          </button>
        </div>
      </div>
    )
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
