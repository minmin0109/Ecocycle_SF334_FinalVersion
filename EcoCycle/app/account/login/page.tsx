// Account Login Page Component
"use client"
import Footer from '@/components/Footer';
import Head from 'next/head';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

const LoginPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State for form values
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  // State for showing form errors
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    general: ''
  });
  
  // State for showing login loading
  const [isLoading, setIsLoading] = useState(false);
  
  // Check for success messages from registration
  useEffect(() => {
    if (searchParams?.get('registered') === 'true') {
      // Show success message for newly registered users
      alert('Registration successful! Please log in with your new account.');
    }
    
    if (searchParams?.get('required') === 'true') {
      // Show message for users who tried to access protected pages
      setErrors(prev => ({
        ...prev,
        general: 'Please log in to view your orders'
      }));
    }
  }, [searchParams]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Prevent any default behavior or event capture
      e.stopPropagation();
      
      const res = await fetch('http://127.0.0.1:8000/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: email, password }),
      });

      const data = await res.json();
      console.log("Login response data:", data);

      if (res.ok) {
        // Store auth data
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userId', data.user?.id?.toString() || '');
        localStorage.setItem('token', data.token || '');
        
        // Store the user role explicitly
        const userRole = data.user?.role || 'customer';
        localStorage.setItem('userRole', userRole);
        
        // Add a delay to give storage time to complete
        setTimeout(() => {
          // Use a final confirmation to see if redirect happens
          if (userRole === 'admin') {
            const confirmRedirect = window.confirm(
              "You are an admin user. Click OK to go to admin dashboard."
            );
            
            if (confirmRedirect) {
              console.log("ADMIN REDIRECT CONFIRMED");
              
              // Try the most direct navigation approach
              try {
                // Completely bypass Next.js routing
                console.log("Attempting hard navigation to admin dashboard");
                document.location.replace('/admin/dashboard');
                
                // Fallback if the above doesn't trigger immediately
                setTimeout(() => {
                  console.log("Fallback navigation attempt");
                  window.location.href = '/admin/dashboard';
                }, 200);
              } catch (navError) {
                console.error("Navigation error:", navError);
                alert("Error during navigation: " + navError);
              }
            }
          } else {
            console.log("Redirecting customer to products");
            window.location.href = '/products';
          }
        }, 100);
      } else {
        setErrors(prev => ({
          ...prev,
          general: data.error || 'Invalid email or password',
        }));
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrors(prev => ({
        ...prev,
        general: 'An error occurred during login',
      }));
    }

    setIsLoading(false);
  };
  

  
  return (
    <>
      <Head>
        <title>Login - EcoCycle</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className="flex flex-col min-h-screen bg-gray-50">
        <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
              <p className="text-gray-600">Sign in to your EcoCycle account</p>
            </div>
            
            <div className="bg-white py-8 px-6 shadow-lg rounded-xl mb-6">
              {errors.general && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                  <p>{errors.general}</p>
                </div>
              )}
              
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 ">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full p-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 placeholder:text-gray-500 text-gray-700 `}
                    placeholder="Email"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <Link href="/account/forgot-password" className="text-sm text-emerald-600 hover:text-emerald-500 ">
                      Forgot password?
                    </Link>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full p-3 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 placeholder:text-gray-500 text-gray-800`}
                    placeholder="Password"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-200"
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing in...
                      </span>
                    ) : (
                      'Sign in'
                    )}
                  </button>
                </div>
              </form>
            </div>
            
            <div className="text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link href="/account/signup" className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors duration-200">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default LoginPage;