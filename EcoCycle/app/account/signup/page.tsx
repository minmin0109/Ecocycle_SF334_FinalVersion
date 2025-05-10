"use client";
import Head from 'next/head';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const SignupPage = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    general: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for the field being edited
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '', general: '' });
  
    let isValid = true;
    const newErrors = { ...errors };
  
    // Validate all fields are filled
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
      isValid = false;
    }
  
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
      isValid = false;
    }
  
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }
  
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      isValid = false;
    }
  
    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }
  
    if (!isValid) {
      setErrors(newErrors);
      return;
    }
  
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:8000/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.email,
          password: formData.password,
          first_name: formData.firstName,
          last_name: formData.lastName
        }),
        
      });
  
      const data = await res.json();
      if (res.ok) {
        // User successfully registered
        alert('Registration successful! Please log in with your new account.');
        router.push('/account/login');
      } else {
        setErrors(prev => ({ ...prev, general: data.error || 'Registration failed' }));
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, general: 'Server error. Please try again.' }));
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <>
      <Head>
        <title>Create Account - EcoCycle</title>
      </Head>

      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Account</h1>
            <p className="text-gray-600">Join EcoCycle and start shopping sustainably</p>
          </div>
          
          <div className="bg-white py-8 px-6 shadow-md rounded-lg">
            {errors.general && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                <p>{errors.general}</p>
              </div>
            )}
            
            <form onSubmit={handleSignup} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input 
                    name="firstName" 
                    type="text" 
                    value={formData.firstName} 
                    onChange={handleChange}
                    className={`w-full p-3 border ${errors.firstName ? 'border-red-500' : 'border-gray-300'} text-gray-900 rounded-lg`} 
                    required 
                  />
                  {errors.firstName && <p className="text-sm text-red-600">{errors.firstName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input 
                    name="lastName" 
                    type="text" 
                    value={formData.lastName} 
                    onChange={handleChange}
                    className={`w-full p-3 border ${errors.lastName ? 'border-red-500' : 'border-gray-300'} text-gray-900 rounded-lg`} 
                    required 
                  />
                  {errors.lastName && <p className="text-sm text-red-600">{errors.lastName}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input 
                  name="email" 
                  type="email" 
                  value={formData.email} 
                  onChange={handleChange}
                  className={`w-full p-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} text-gray-900 rounded-lg`} 
                  required 
                />
                {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <input 
                  name="password" 
                  type="password" 
                  value={formData.password} 
                  onChange={handleChange}
                  className={`w-full p-3 border ${errors.password ? 'border-red-500' : 'border-gray-300'} text-gray-900 rounded-lg`} 
                  required 
                  minLength={8}
                />
                {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input 
                  name="confirmPassword" 
                  type="password" 
                  value={formData.confirmPassword} 
                  onChange={handleChange}
                  className={`w-full p-3 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} text-gray-900 rounded-lg`} 
                  required 
                />
                {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword}</p>}
              </div>

              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="terms" 
                  required 
                  className="h-4 w-4 text-emerald-600 border-gray-300 rounded" 
                />
                <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
                  I agree to the Terms of Service and Privacy Policy <span className="text-red-500">*</span>
                </label>
              </div>

              <div className="text-right text-sm text-gray-500">
                <p><span className="text-red-500">*</span> Required fields</p>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium"
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          </div>
          
          <div className="text-center mt-6">
            <p className="text-gray-600">
              Already have an account?{' '}
              <a href="/account/login" className="text-emerald-600 hover:underline">Sign in</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignupPage;