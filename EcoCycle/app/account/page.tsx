<<<<<<< HEAD
"use client"
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Head from 'next/head';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Define user profile type
interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  defaultShippingAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  memberSince: string;
  recentOrders: {
    id: string;
    date: string;
    total: number;
    status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  }[];
}

// Define address form state interface
interface AddressFormState {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

const AccountPage = () => {
  const router = useRouter();
  
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // User profile state
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses' | 'settings'>('profile');
  
  // Address management states
  const [editingAddress, setEditingAddress] = useState(false);
  const [addingAddress, setAddingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState<AddressFormState>({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States'
  });
  
  // Check if user is authenticated
  useEffect(() => {
    // In a real app, you would validate authentication from a secure source
    const checkAuthStatus = async () => {
      try {
        // Simulate API call to verify authentication
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // For demo, check local storage
        const isAuth = localStorage.getItem('isAuthenticated') === 'true';
        
        if (!isAuth) {
          router.push('/account/login?required=true&returnUrl=/account');
          return;
        }
        
        setIsAuthenticated(true);
        
        // Load user profile
        loadUserProfile();
      } catch (error) {
        console.error('Error checking authentication status', error);
        router.push('/account/login');
      }
    };
    
    checkAuthStatus();
  }, [router]);
  
  // Load user profile data
  const loadUserProfile = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock user profile data
      setUserProfile({
        id: 'U123456',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '(555) 123-4567',
        defaultShippingAddress: {
          street: '123 Main Street',
          city: 'San Francisco',
          state: 'CA',
          postalCode: '94103',
          country: 'United States'
        },
        memberSince: 'January 15, 2025',
        recentOrders: [
          { id: 'ECO-12345678', date: 'May 1, 2025', total: 35.97, status: 'delivered' },
          { id: 'ECO-87654321', date: 'Apr 15, 2025', total: 15.99, status: 'shipped' },
          { id: 'ECO-11223344', date: 'Mar 22, 2025', total: 67.45, status: 'delivered' }
        ]
      });
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading user profile', error);
    }
  };
  
  // Handle tab change
  const handleTabChange = (tab: 'profile' | 'orders' | 'addresses' | 'settings') => {
    setActiveTab(tab);
  };
  
  // Handle logout
  const handleLogout = () => {
    // Clear authentication state
    localStorage.removeItem('isAuthenticated');
    
    // Redirect to login page
    router.push('/account/login/');
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };
  
  // Address related functions
  const initAddressForm = () => {
    if (userProfile?.defaultShippingAddress) {
      setAddressForm({
        street: userProfile.defaultShippingAddress.street,
        city: userProfile.defaultShippingAddress.city,
        state: userProfile.defaultShippingAddress.state,
        postalCode: userProfile.defaultShippingAddress.postalCode,
        country: userProfile.defaultShippingAddress.country
      });
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAddressForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const saveAddressChanges = () => {
    // In a real app, this would call your API
    setUserProfile(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        defaultShippingAddress: {
          street: addressForm.street,
          city: addressForm.city,
          state: addressForm.state,
          postalCode: addressForm.postalCode,
          country: addressForm.country
        }
      };
    });
    setEditingAddress(false);
    setAddingAddress(false);
    alert('Address saved successfully!');
  };

  const deleteAddress = () => {
    const confirm = window.confirm('Are you sure you want to delete this address?');
    if (confirm) {
      setUserProfile(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          defaultShippingAddress: undefined
        };
      });
      alert('Address deleted successfully!');
    }
  };

  const startEditingAddress = () => {
    initAddressForm();
    setEditingAddress(true);
  };

  const startAddingAddress = () => {
    setAddressForm({
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'United States'
    });
    setAddingAddress(true);
  };

  const cancelAddressEdit = () => {
    setEditingAddress(false);
    setAddingAddress(false);
  };
  
  // If still checking auth status or loading data
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your account...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  // If not authenticated, redirect (should not reach this point due to useEffect)
  if (!isAuthenticated || !userProfile) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-lg mb-2">Authentication Required</div>
            <p className="text-gray-600 mb-4">Please log in to view your account.</p>
            <Link 
              href="/account/login"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700"
            >
              Go to Login
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <>
      <Head>
        <title>My Account - EcoCycle</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        
        <main className="flex-grow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="md:flex md:items-center md:justify-between mb-8">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                  My Account
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Manage your EcoCycle account settings and preferences
                </p>
              </div>
              <div className="mt-4 flex md:mt-0 md:ml-4">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sidebar Navigation */}
              <div className="lg:col-span-1">
                <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
                  <div className="p-6 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
                        <span className="text-emerald-600 font-medium text-xl">
                          {userProfile.firstName.charAt(0)}{userProfile.lastName.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <h2 className="text-lg font-medium text-gray-900">
                          {userProfile.firstName} {userProfile.lastName}
                        </h2>
                        <p className="text-sm text-gray-500">
                          Member since {userProfile.memberSince}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <nav className="space-y-1 p-4">
                    <button
                      onClick={() => handleTabChange('profile')}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                        activeTab === 'profile'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className={`mr-3 h-5 w-5 ${
                        activeTab === 'profile' ? 'text-emerald-500' : 'text-gray-400'
                      }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Profile Information
                    </button>
                    
                    <button
                      onClick={() => handleTabChange('orders')}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                        activeTab === 'orders'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className={`mr-3 h-5 w-5 ${
                        activeTab === 'orders' ? 'text-emerald-500' : 'text-gray-400'
                      }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      My Orders
                    </button>
                    
                    <button
                      onClick={() => handleTabChange('addresses')}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                        activeTab === 'addresses'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className={`mr-3 h-5 w-5 ${
                        activeTab === 'addresses' ? 'text-emerald-500' : 'text-gray-400'
                      }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Addresses
                    </button>
                    
                    <button
                      onClick={() => handleTabChange('settings')}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                        activeTab === 'settings'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className={`mr-3 h-5 w-5 ${
                        activeTab === 'settings' ? 'text-emerald-500' : 'text-gray-400'
                      }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Account Settings
                    </button>
                  </nav>
                </div>
                
                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Need Help?</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Contact our customer support team for assistance with your account.
                    </p>
                    <button
                      onClick={() => {
                        alert('Need help? Contact support at support@ecocycle.com');
                      }}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-emerald-700 bg-emerald-100 hover:bg-emerald-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                    >
                      Contact Support
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Main Content */}
              <div className="lg:col-span-3">
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                      <h2 className="text-xl font-medium text-gray-900">Profile Information</h2>
                      <p className="mt-1 text-sm text-gray-500">
                        Update your personal information and contact details
                      </p>
                    </div>
                    
                    <div className="p-6 bg-gray-50">
                      <form className="space-y-6">
                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                          <div className="sm:col-span-3">
                            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                              First name
                            </label>
                            <input
                              type="text"
                              name="firstName"
                              id="firstName"
                              defaultValue={userProfile.firstName}
                              className="mt-1 focus:ring-emerald-500 focus:border-emerald-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-black"
                            />
                          </div>
                          
                          <div className="sm:col-span-3">
                            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                              Last name
                            </label>
                            <input
                              type="text"
                              name="lastName"
                              id="lastName"
                              defaultValue={userProfile.lastName}
                              className="mt-1 focus:ring-emerald-500 focus:border-emerald-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-black"
                            />
                          </div>
                          
                          <div className="sm:col-span-4">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                              Email address
                            </label>
                            <input
                              type="email"
                              name="email"
                              id="email"
                              defaultValue={userProfile.email}
                              className="mt-1 focus:ring-emerald-500 focus:border-emerald-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-black"
                            />
                          </div>
                          
                          <div className="sm:col-span-4">
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                              Phone number
                            </label>
                            <input
                              type="tel"
                              name="phone"
                              id="phone"
                              defaultValue={userProfile.phone}
                              className="mt-1 focus:ring-emerald-500 focus:border-emerald-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-black"
                            />
                          </div>
                        </div>
                        
                        <div className="pt-5">
                          <div className="flex justify-end">
                            <button
                              type="button"
                              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                              onClick={(e) => {
                                e.preventDefault();
                                alert('Profile updated successfully!');
                              }}
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
                
                {/* Orders Tab */}
                {activeTab === 'orders' && (
                  <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                      <div>
                        <h2 className="text-xl font-medium text-gray-900">My Orders</h2>
                        <p className="mt-1 text-sm text-gray-500">
                          View and track your recent orders
                        </p>
                      </div>
                      <Link
                        href="/account/orders"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                      >
                        View All Orders
                      </Link>
                    </div>
                    
                    <div className="divide-y divide-gray-200">
                      {userProfile.recentOrders.map((order) => (
                        <div key={order.id} className="p-6 hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">
                                Order #{order.id}
                              </h3>
                              <p className="text-sm text-gray-500">{order.date}</p>
                            </div>
                            <div className="flex items-center">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                                  order.status === 'shipped' ? 'bg-blue-100 text-blue-800' : 
                                  order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' : 
                                  'bg-red-100 text-red-800'}`
                              }>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="mt-4 flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900">
                              Total: {formatCurrency(order.total)}
                            </span>
                            <Link
                              href={`/account/orders/${order.id}`}
                              className="text-sm font-medium text-emerald-600 hover:text-emerald-500"
                            >
                              View Order Details
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Addresses Tab */}
                {activeTab === 'addresses' && (
                  <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                      <div>
                        <h2 className="text-xl font-medium text-gray-900">Saved Addresses</h2>
                        <p className="mt-1 text-sm text-gray-500">
                          Manage your shipping and billing addresses
                        </p>
                      </div>
                      {!addingAddress && !editingAddress && !userProfile?.defaultShippingAddress && (
                        <button
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                          onClick={startAddingAddress}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Add New Address
                        </button>
                      )}
                    </div>

                    <div className="p-6">
                      {userProfile?.defaultShippingAddress && !editingAddress && !addingAddress ? (
                        // Display existing address
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">Default Shipping Address</h3>
                              <p className="mt-1 text-sm text-gray-500">Also used for billing</p>
                            </div>
                            <div className="flex">
                              <button
                                className="text-sm font-medium text-emerald-600 hover:text-emerald-500 mr-4"
                                onClick={startEditingAddress}
                              >
                                Edit
                              </button>
                              <button
                                className="text-sm font-medium text-red-600 hover:text-red-500"
                                onClick={deleteAddress}
                              >
                                Delete
                              </button>
                            </div>
                          </div>

                          <div className="text-sm text-gray-700">
                            <p className="font-medium">{userProfile.firstName} {userProfile.lastName}</p>
                            <p>{userProfile.defaultShippingAddress.street}</p>
                            <p>
                              {userProfile.defaultShippingAddress.city}, {userProfile.defaultShippingAddress.state} {userProfile.defaultShippingAddress.postalCode}
                            </p>
                            <p>{userProfile.defaultShippingAddress.country}</p>
                            <p className="mt-2">{userProfile.phone}</p>
                          </div>
                        </div>
                      ) : (editingAddress || addingAddress) ? (
                        // Edit/Add address form
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">
                                {editingAddress ? 'Edit Address' : 'Add New Address'}
                              </h3>
                            </div>
                            <button
                              className="text-sm font-medium text-gray-600 hover:text-gray-500"
                              onClick={cancelAddressEdit}
                            >
                              Cancel
                            </button>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <label htmlFor="street" className="block text-sm font-medium text-gray-700">Street Address</label>
                              <input
                                type="text"
                                name="street"
                                id="street"
                                value={addressForm.street}
                                onChange={handleAddressChange}
                                className="mt-1 focus:ring-emerald-500 focus:border-emerald-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-black"
                                placeholder="123 Main St"
                              />
                            </div>

                            <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-6">
                              <div className="sm:col-span-3">
                                <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                                <input
                                  type="text"
                                  name="city"
                                  id="city"
                                  value={addressForm.city}
                                  onChange={handleAddressChange}
                                  className="mt-1 focus:ring-emerald-500 focus:border-emerald-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-black"
                                  placeholder="San Francisco"
                                />
                              </div>

                              <div className="sm:col-span-3">
                                <label htmlFor="state" className="block text-sm font-medium text-gray-700">State / Province</label>
                                <input
                                  type="text"
                                  name="state"
                                  id="state"
                                  value={addressForm.state}
                                  onChange={handleAddressChange}
                                  className="mt-1 focus:ring-emerald-500 focus:border-emerald-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-black"
                                  placeholder="CA"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-6">
                              <div className="sm:col-span-3">
                                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">Postal Code</label>
                                <input
                                  type="text"
                                  name="postalCode"
                                  id="postalCode"
                                  value={addressForm.postalCode}
                                  onChange={handleAddressChange}
                                  className="mt-1 focus:ring-emerald-500 focus:border-emerald-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-black"
                                  placeholder="94103"
                                />
                              </div>

                              <div className="sm:col-span-3">
                                <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>

                                <input
                                  type="text"
                                  name="country"
                                  id="country"
                                  value={addressForm.country}
                                  onChange={handleAddressChange}
                                  className="mt-1 focus:ring-emerald-500 focus:border-emerald-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-black"
                                  placeholder="United States"
                                />
                              </div>
                            </div>

                            <div className="flex justify-end pt-4">
                              <button
                                type="button"
                                onClick={saveAddressChanges}
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                              >
                                {editingAddress ? 'Update Address' : 'Save Address'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Empty state - no addresses
                        <div className="text-center py-8">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <p className="text-gray-600 mb-4">You don't have any saved addresses.</p>
                          <button
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                            onClick={startAddingAddress}
                          >
                            Add Address
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Settings Tab */}
                {activeTab === 'settings' && (
                  <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                      <h2 className="text-xl font-medium text-gray-900">Account Settings</h2>
                      <p className="mt-1 text-sm text-gray-500">
                        Manage your account preferences and security settings
                      </p>
                    </div>
                    
                    <div className="p-6 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Password</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-700 mb-4">
                          For security reasons, we use email verification to change your password. Click the button below to receive a password reset link via email.
                        </p>
                        
                        <div className="flex justify-end">
                          <button
                            type="button"
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                            onClick={() => {
                              // Simulate sending email
                              setTimeout(() => {
                                alert('Password reset link has been sent to your email address. Please check your inbox to continue.');
                              }, 1000);
                            }}
                          >
                            Send Password Reset Email
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Email Preferences</h3>
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="order-updates"
                              name="order-updates"
                              type="checkbox"
                              defaultChecked
                              className="focus:ring-emerald-500 h-4 w-4 text-emerald-600 border-gray-300 rounded"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="order-updates" className="font-medium text-gray-700">Order Updates</label>
                            <p className="text-gray-500">Receive email notifications about your orders and deliveries</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="promotions"
                              name="promotions"
                              type="checkbox"
                              defaultChecked
                              className="focus:ring-emerald-500 h-4 w-4 text-emerald-600 border-gray-300 rounded"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="promotions" className="font-medium text-gray-700">Promotions</label>
                            <p className="text-gray-500">Receive emails about promotions, discounts, and special offers</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="newsletter"
                              name="newsletter"
                              type="checkbox"
                              defaultChecked
                              className="focus:ring-emerald-500 h-4 w-4 text-emerald-600 border-gray-300 rounded"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="newsletter" className="font-medium text-gray-700">Newsletter</label>
                            <p className="text-gray-500">Receive our monthly newsletter with eco-friendly tips and articles</p>
                          </div>
                        </div>
                        
                        <div className="flex justify-end">
                          <button
                            type="button"
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                            onClick={() => alert('Email preferences updated successfully!')}
                          >
                            Save Preferences
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Danger Zone</h3>
                      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <h4 className="text-md font-medium text-red-800 mb-2">Delete Account</h4>
                        <p className="text-sm text-red-700 mb-4">
                          Once you delete your account, there is no going back. Please be certain.
                        </p>
                        <button
                          type="button"
                          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          onClick={() => {
                            const confirm = window.confirm('Are you sure you want to delete your account? This action cannot be undone.');
                            if (confirm) {
                              alert('Account deletion request submitted. You will receive an email with further instructions.');
                            }
                          }}
                        >
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default AccountPage;
=======
"use client"
import Header from '@/components/Header';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Define user profile type
interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  defaultShippingAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  memberSince: string;
  recentOrders: {
    id: string;
    date: string;
    total: number;
    status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  }[];
}

// Define address form state interface
interface AddressFormState {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

const AccountPage = () => {
  const router = useRouter();
  
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // User profile state
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses' | 'settings'>('profile');
  
  // Address management states
  const [editingAddress, setEditingAddress] = useState(false);
  const [addingAddress, setAddingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState<AddressFormState>({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States'
  });
  
  // Check if user is authenticated
  useEffect(() => {
    // In a real app, you would validate authentication from a secure source
    const checkAuthStatus = async () => {
      try {
        // Simulate API call to verify authentication
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // For demo, check local storage
        const isAuth = localStorage.getItem('isAuthenticated') === 'true';
        
        if (!isAuth) {
          router.push('/account/login?required=true&returnUrl=/account');
          return;
        }
        
        setIsAuthenticated(true);
        
        // Load user profile
        loadUserProfile();
      } catch (error) {
        console.error('Error checking authentication status', error);
        router.push('/account/login');
      }
    };
    
    checkAuthStatus();
  }, [router]);
  
  // Load user profile data
  const loadUserProfile = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock user profile data
      setUserProfile({
        id: 'U123456',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '(555) 123-4567',
        defaultShippingAddress: {
          street: '123 Main Street',
          city: 'San Francisco',
          state: 'CA',
          postalCode: '94103',
          country: 'United States'
        },
        memberSince: 'January 15, 2025',
        recentOrders: [
          { id: 'ECO-12345678', date: 'May 1, 2025', total: 35.97, status: 'delivered' },
          { id: 'ECO-87654321', date: 'Apr 15, 2025', total: 15.99, status: 'shipped' },
          { id: 'ECO-11223344', date: 'Mar 22, 2025', total: 67.45, status: 'delivered' }
        ]
      });
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading user profile', error);
    }
  };
  
  // Handle tab change
  const handleTabChange = (tab: 'profile' | 'orders' | 'addresses' | 'settings') => {
    setActiveTab(tab);
  };
  
  // Handle logout
  const handleLogout = () => {
    // Clear authentication state
    localStorage.removeItem('isAuthenticated');
    
    // Redirect to login page
    router.push('/account/login/');
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };
  
  // Address related functions
  const initAddressForm = () => {
    if (userProfile?.defaultShippingAddress) {
      setAddressForm({
        street: userProfile.defaultShippingAddress.street,
        city: userProfile.defaultShippingAddress.city,
        state: userProfile.defaultShippingAddress.state,
        postalCode: userProfile.defaultShippingAddress.postalCode,
        country: userProfile.defaultShippingAddress.country
      });
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAddressForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const saveAddressChanges = () => {
    // In a real app, this would call your API
    setUserProfile(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        defaultShippingAddress: {
          street: addressForm.street,
          city: addressForm.city,
          state: addressForm.state,
          postalCode: addressForm.postalCode,
          country: addressForm.country
        }
      };
    });
    setEditingAddress(false);
    setAddingAddress(false);
    alert('Address saved successfully!');
  };

  const deleteAddress = () => {
    const confirm = window.confirm('Are you sure you want to delete this address?');
    if (confirm) {
      setUserProfile(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          defaultShippingAddress: undefined
        };
      });
      alert('Address deleted successfully!');
    }
  };

  const startEditingAddress = () => {
    initAddressForm();
    setEditingAddress(true);
  };

  const startAddingAddress = () => {
    setAddressForm({
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'United States'
    });
    setAddingAddress(true);
  };

  const cancelAddressEdit = () => {
    setEditingAddress(false);
    setAddingAddress(false);
  };
  
  // If still checking auth status or loading data
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your account...</p>
          </div>
        </main>
      </div>
    );
  }
  
  // If not authenticated, redirect (should not reach this point due to useEffect)
  if (!isAuthenticated || !userProfile) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-lg mb-2">Authentication Required</div>
            <p className="text-gray-600 mb-4">Please log in to view your account.</p>
            <Link 
              href="/account/login"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700"
            >
              Go to Login
            </Link>
          </div>
        </main>

      </div>
    );
  }
  
  return (
    <>

        <title>My Account - EcoCycle</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />


      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        
        <main className="flex-grow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="md:flex md:items-center md:justify-between mb-8">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                  My Account
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Manage your EcoCycle account settings and preferences
                </p>
              </div>
              <div className="mt-4 flex md:mt-0 md:ml-4">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sidebar Navigation */}
              <div className="lg:col-span-1">
                <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
                  <div className="p-6 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
                        <span className="text-emerald-600 font-medium text-xl">
                          {userProfile.firstName.charAt(0)}{userProfile.lastName.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <h2 className="text-lg font-medium text-gray-900">
                          {userProfile.firstName} {userProfile.lastName}
                        </h2>
                        <p className="text-sm text-gray-500">
                          Member since {userProfile.memberSince}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <nav className="space-y-1 p-4">
                    <button
                      onClick={() => handleTabChange('profile')}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                        activeTab === 'profile'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className={`mr-3 h-5 w-5 ${
                        activeTab === 'profile' ? 'text-emerald-500' : 'text-gray-400'
                      }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Profile Information
                    </button>
                    
                    <button
                      onClick={() => handleTabChange('orders')}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                        activeTab === 'orders'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className={`mr-3 h-5 w-5 ${
                        activeTab === 'orders' ? 'text-emerald-500' : 'text-gray-400'
                      }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      My Orders
                    </button>
                    
                    <button
                      onClick={() => handleTabChange('addresses')}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                        activeTab === 'addresses'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className={`mr-3 h-5 w-5 ${
                        activeTab === 'addresses' ? 'text-emerald-500' : 'text-gray-400'
                      }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Addresses
                    </button>
                    
                    <button
                      onClick={() => handleTabChange('settings')}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                        activeTab === 'settings'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className={`mr-3 h-5 w-5 ${
                        activeTab === 'settings' ? 'text-emerald-500' : 'text-gray-400'
                      }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Account Settings
                    </button>
                  </nav>
                </div>
                
                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Need Help?</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Contact our customer support team for assistance with your account.
                    </p>
                    <button
                      onClick={() => {
                        alert('Need help? Contact support at support@ecocycle.com');
                      }}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-emerald-700 bg-emerald-100 hover:bg-emerald-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                    >
                      Contact Support
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Main Content */}
              <div className="lg:col-span-3">
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                      <h2 className="text-xl font-medium text-gray-900">Profile Information</h2>
                      <p className="mt-1 text-sm text-gray-500">
                        Update your personal information and contact details
                      </p>
                    </div>
                    
                    <div className="p-6 bg-gray-50">
                      <form className="space-y-6">
                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                          <div className="sm:col-span-3">
                            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                              First name
                            </label>
                            <input
                              type="text"
                              name="firstName"
                              id="firstName"
                              defaultValue={userProfile.firstName}
                              className="mt-1 focus:ring-emerald-500 focus:border-emerald-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-black"
                            />
                          </div>
                          
                          <div className="sm:col-span-3">
                            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                              Last name
                            </label>
                            <input
                              type="text"
                              name="lastName"
                              id="lastName"
                              defaultValue={userProfile.lastName}
                              className="mt-1 focus:ring-emerald-500 focus:border-emerald-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-black"
                            />
                          </div>
                          
                          <div className="sm:col-span-4">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                              Email address
                            </label>
                            <input
                              type="email"
                              name="email"
                              id="email"
                              defaultValue={userProfile.email}
                              className="mt-1 focus:ring-emerald-500 focus:border-emerald-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-black"
                            />
                          </div>
                          
                          <div className="sm:col-span-4">
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                              Phone number
                            </label>
                            <input
                              type="tel"
                              name="phone"
                              id="phone"
                              defaultValue={userProfile.phone}
                              className="mt-1 focus:ring-emerald-500 focus:border-emerald-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-black"
                            />
                          </div>
                        </div>
                        
                        <div className="pt-5">
                          <div className="flex justify-end">
                            <button
                              type="button"
                              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                              onClick={(e) => {
                                e.preventDefault();
                                alert('Profile updated successfully!');
                              }}
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
                
                {/* Orders Tab */}
                {activeTab === 'orders' && (
                  <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                      <div>
                        <h2 className="text-xl font-medium text-gray-900">My Orders</h2>
                        <p className="mt-1 text-sm text-gray-500">
                          View and track your recent orders
                        </p>
                      </div>
                      <Link
                        href="/account/orders"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                      >
                        View All Orders
                      </Link>
                    </div>
                    
                    <div className="divide-y divide-gray-200">
                      {userProfile.recentOrders.map((order) => (
                        <div key={order.id} className="p-6 hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">
                                Order #{order.id}
                              </h3>
                              <p className="text-sm text-gray-500">{order.date}</p>
                            </div>
                            <div className="flex items-center">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                                  order.status === 'shipped' ? 'bg-blue-100 text-blue-800' : 
                                  order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' : 
                                  'bg-red-100 text-red-800'}`
                              }>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="mt-4 flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900">
                              Total: {formatCurrency(order.total)}
                            </span>
                            <Link
                              href={`/account/orders/${order.id}`}
                              className="text-sm font-medium text-emerald-600 hover:text-emerald-500"
                            >
                              View Order Details
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Addresses Tab */}
                {activeTab === 'addresses' && (
                  <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                      <div>
                        <h2 className="text-xl font-medium text-gray-900">Saved Addresses</h2>
                        <p className="mt-1 text-sm text-gray-500">
                          Manage your shipping and billing addresses
                        </p>
                      </div>
                      {!addingAddress && !editingAddress && !userProfile?.defaultShippingAddress && (
                        <button
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                          onClick={startAddingAddress}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Add New Address
                        </button>
                      )}
                    </div>

                    <div className="p-6">
                      {userProfile?.defaultShippingAddress && !editingAddress && !addingAddress ? (
                        // Display existing address
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">Default Shipping Address</h3>
                              <p className="mt-1 text-sm text-gray-500">Also used for billing</p>
                            </div>
                            <div className="flex">
                              <button
                                className="text-sm font-medium text-emerald-600 hover:text-emerald-500 mr-4"
                                onClick={startEditingAddress}
                              >
                                Edit
                              </button>
                              <button
                                className="text-sm font-medium text-red-600 hover:text-red-500"
                                onClick={deleteAddress}
                              >
                                Delete
                              </button>
                            </div>
                          </div>

                          <div className="text-sm text-gray-700">
                            <p className="font-medium">{userProfile.firstName} {userProfile.lastName}</p>
                            <p>{userProfile.defaultShippingAddress.street}</p>
                            <p>
                              {userProfile.defaultShippingAddress.city}, {userProfile.defaultShippingAddress.state} {userProfile.defaultShippingAddress.postalCode}
                            </p>
                            <p>{userProfile.defaultShippingAddress.country}</p>
                            <p className="mt-2">{userProfile.phone}</p>
                          </div>
                        </div>
                      ) : (editingAddress || addingAddress) ? (
                        // Edit/Add address form
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">
                                {editingAddress ? 'Edit Address' : 'Add New Address'}
                              </h3>
                            </div>
                            <button
                              className="text-sm font-medium text-gray-600 hover:text-gray-500"
                              onClick={cancelAddressEdit}
                            >
                              Cancel
                            </button>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <label htmlFor="street" className="block text-sm font-medium text-gray-700">Street Address</label>
                              <input
                                type="text"
                                name="street"
                                id="street"
                                value={addressForm.street}
                                onChange={handleAddressChange}
                                className="mt-1 focus:ring-emerald-500 focus:border-emerald-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-black"
                                placeholder="123 Main St"
                              />
                            </div>

                            <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-6">
                              <div className="sm:col-span-3">
                                <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                                <input
                                  type="text"
                                  name="city"
                                  id="city"
                                  value={addressForm.city}
                                  onChange={handleAddressChange}
                                  className="mt-1 focus:ring-emerald-500 focus:border-emerald-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-black"
                                  placeholder="San Francisco"
                                />
                              </div>

                              <div className="sm:col-span-3">
                                <label htmlFor="state" className="block text-sm font-medium text-gray-700">State / Province</label>
                                <input
                                  type="text"
                                  name="state"
                                  id="state"
                                  value={addressForm.state}
                                  onChange={handleAddressChange}
                                  className="mt-1 focus:ring-emerald-500 focus:border-emerald-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-black"
                                  placeholder="CA"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-6">
                              <div className="sm:col-span-3">
                                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">Postal Code</label>
                                <input
                                  type="text"
                                  name="postalCode"
                                  id="postalCode"
                                  value={addressForm.postalCode}
                                  onChange={handleAddressChange}
                                  className="mt-1 focus:ring-emerald-500 focus:border-emerald-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-black"
                                  placeholder="94103"
                                />
                              </div>

                              <div className="sm:col-span-3">
                                <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>

                                <input
                                  type="text"
                                  name="country"
                                  id="country"
                                  value={addressForm.country}
                                  onChange={handleAddressChange}
                                  className="mt-1 focus:ring-emerald-500 focus:border-emerald-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-black"
                                  placeholder="United States"
                                />
                              </div>
                            </div>

                            <div className="flex justify-end pt-4">
                              <button
                                type="button"
                                onClick={saveAddressChanges}
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                              >
                                {editingAddress ? 'Update Address' : 'Save Address'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Empty state - no addresses
                        <div className="text-center py-8">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <p className="text-gray-600 mb-4">You don't have any saved addresses.</p>
                          <button
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                            onClick={startAddingAddress}
                          >
                            Add Address
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Settings Tab */}
                {activeTab === 'settings' && (
                  <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                      <h2 className="text-xl font-medium text-gray-900">Account Settings</h2>
                      <p className="mt-1 text-sm text-gray-500">
                        Manage your account preferences and security settings
                      </p>
                    </div>
                    
                    <div className="p-6 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Password</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-700 mb-4">
                          For security reasons, we use email verification to change your password. Click the button below to receive a password reset link via email.
                        </p>
                        
                        <div className="flex justify-end">
                          <button
                            type="button"
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                            onClick={() => {
                              // Simulate sending email
                              setTimeout(() => {
                                alert('Password reset link has been sent to your email address. Please check your inbox to continue.');
                              }, 1000);
                            }}
                          >
                            Send Password Reset Email
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Email Preferences</h3>
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="order-updates"
                              name="order-updates"
                              type="checkbox"
                              defaultChecked
                              className="focus:ring-emerald-500 h-4 w-4 text-emerald-600 border-gray-300 rounded"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="order-updates" className="font-medium text-gray-700">Order Updates</label>
                            <p className="text-gray-500">Receive email notifications about your orders and deliveries</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="promotions"
                              name="promotions"
                              type="checkbox"
                              defaultChecked
                              className="focus:ring-emerald-500 h-4 w-4 text-emerald-600 border-gray-300 rounded"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="promotions" className="font-medium text-gray-700">Promotions</label>
                            <p className="text-gray-500">Receive emails about promotions, discounts, and special offers</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="newsletter"
                              name="newsletter"
                              type="checkbox"
                              defaultChecked
                              className="focus:ring-emerald-500 h-4 w-4 text-emerald-600 border-gray-300 rounded"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="newsletter" className="font-medium text-gray-700">Newsletter</label>
                            <p className="text-gray-500">Receive our monthly newsletter with eco-friendly tips and articles</p>
                          </div>
                        </div>
                        
                        <div className="flex justify-end">
                          <button
                            type="button"
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                            onClick={() => alert('Email preferences updated successfully!')}
                          >
                            Save Preferences
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Danger Zone</h3>
                      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <h4 className="text-md font-medium text-red-800 mb-2">Delete Account</h4>
                        <p className="text-sm text-red-700 mb-4">
                          Once you delete your account, there is no going back. Please be certain.
                        </p>
                        <button
                          type="button"
                          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          onClick={() => {
                            const confirm = window.confirm('Are you sure you want to delete your account? This action cannot be undone.');
                            if (confirm) {
                              alert('Account deletion request submitted. You will receive an email with further instructions.');
                            }
                          }}
                        >
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default AccountPage;
>>>>>>> 881b91f (Backend)
