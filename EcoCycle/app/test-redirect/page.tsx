// /pages/test-redirect.tsx or /app/test-redirect/page.tsx
"use client"
import { useRouter } from 'next/navigation';
import React from 'react';

const TestRedirect = () => {
  const router = useRouter();

  const handleRouterPush = () => {
    console.log("Testing router.push to admin dashboard");
    router.push('/admin/dashboard');
  };

  const handleDirectNavigation = () => {
    console.log("Testing direct navigation to admin dashboard");
    window.location.href = '/admin/dashboard';
  };

  return (
    <div className="p-10">
      <h1 className="text-2xl mb-5">Navigation Test</h1>
      
      <button 
        onClick={handleRouterPush}
        className="bg-blue-500 text-white px-4 py-2 rounded mr-4"
      >
        Go to Admin (router.push)
      </button>
      
      <button 
        onClick={handleDirectNavigation}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Go to Admin (window.location)
      </button>
    </div>
  );
};

export default TestRedirect;