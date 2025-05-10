"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface RouteGuardProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'customer' | null  // null means just authentication is required
}

const RouteGuard: React.FC<RouteGuardProps> = ({ 
  children, 
  requiredRole = null 
}) => {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if running in browser
    if (typeof window === 'undefined') return;

    // Authentication check function
    const checkAuth = () => {
      const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
      const userRole = localStorage.getItem('userRole')
      
      // Not authenticated at all, redirect to login
      if (!isAuthenticated) {
        console.log('Not authenticated, redirecting to login')
        setAuthorized(false)
        setLoading(false)
        router.push('/account/login?required=true&returnUrl=' + window.location.pathname)
        return
      }

      // Authenticated but role check required and failed
      if (requiredRole && userRole !== requiredRole) {
        console.log(`Role ${requiredRole} required, but user is ${userRole}`)
        setAuthorized(false)
        setLoading(false)
        
        // Redirect admin attempts to normal pages to admin dashboard
        if (userRole === 'admin' && requiredRole === 'customer') {
          router.push('/admin/dashboard')
        } 
        // Redirect customers attempting to access admin pages to products
        else if (userRole === 'customer' && requiredRole === 'admin') {
          router.push('/products')
        }
        return
      }

      // All checks passed
      setAuthorized(true)
      setLoading(false)
    }

    // Run auth check on initial load
    checkAuth()

    // Listen for route changes and check auth again
    const handleRouteChange = () => {
      checkAuth()
    }

    // Add event listener for route changes
    window.addEventListener('popstate', handleRouteChange)

    // Clean up event listener
    return () => {
      window.removeEventListener('popstate', handleRouteChange)
    }
  }, [router, requiredRole])

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </main>
      </div>
    )
  }

  // If authorized, render children
  return authorized ? <>{children}</> : null
}

export default RouteGuard