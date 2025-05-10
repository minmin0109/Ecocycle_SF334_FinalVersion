// utils/authCheck.tsx
"use client"
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AuthCheckProps {
  children: React.ReactNode;
  returnUrl?: string;
}

const AuthCheck = ({ children, returnUrl = '' }: AuthCheckProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check if user is authenticated
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    
    if (!isAuthenticated) {
      // Redirect to login page if not authenticated
      // Include the returnUrl so we can redirect back after login
      const redirectUrl = returnUrl ? `/account/login?required=true&returnUrl=${encodeURIComponent(returnUrl)}` : '/account/login?required=true';
      router.push(redirectUrl);
    } else {
      setIsLoading(false);
    }
  }, [router, returnUrl]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }
  
  // Render children if authenticated
  return <>{children}</>;
};

export default AuthCheck;