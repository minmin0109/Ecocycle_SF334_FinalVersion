// Order Details Page Component
"use client"

import Footer from '@/components/Footer';
import Head from 'next/head';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import AuthCheck from '@/utils/authCheck';


// Order type definition
interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  imageUrl: string;
}

interface OrderDetails {
  id: string;
  date: string;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  shipping: {
    name: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  payment: {
    method: string;
    last4?: string;
  };
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  trackingNumber?: string;
  estimatedDelivery?: string;
}

const OrderDetailsPage = () => {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.id as string;

  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) return;

      const userToken = localStorage.getItem('token'); 
      if (!userToken) {
        console.warn("User token not found.");
        return;
      }

      try {
        const res = await fetch(`http://localhost:8000/order/${orderId}/confirmation/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${userToken}`, 
          },
        });

        if (!res.ok) throw new Error('Failed to fetch order details');

        const data = await res.json();

        const mappedData: OrderDetails = {
          id: data.orderId,
          date: data.orderDate,
          status: data.status, 
          items: data.items.map((item: any) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            imageUrl: item.imageUrl,
          })),
          shipping: {
            name: data.shipping.name,
            address: data.shipping.address,
            city: data.shipping.city,
            state: data.shipping.state,
            postalCode: data.shipping.postalCode,
            country: data.shipping.country,
          },
          payment: {
            method: data.payment.method,
            last4: data.payment.last4,
          },
          subtotal: data.subtotal,
          shippingCost: data.shippingCost,
          tax: data.tax,
          total: data.total,
          trackingNumber: '', 
          estimatedDelivery: data.estimatedDelivery,
        };


        setOrderDetails(mappedData);
      } catch (err) {
        console.error('Error fetching order details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const getStatusBadgeColor = (status: OrderDetails['status']) => {
    switch (status) {
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-yellow-100 text-yellow-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} ฿` ;
  };


  return (
    <AuthCheck returnUrl={`/account/orders/${orderId}`}>
      <>
        <Head>
          <title>Order Details - EcoCycle</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </Head>

        <div className="flex flex-col min-h-screen bg-gray-50">
          <main className="flex-grow">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              {/* Back Button */}
              <Link
                href="/account/orders"
                className="inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-500 mb-6"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to Orders
              </Link>

              {isLoading ? (
                <div className="flex justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
                </div>
              ) : orderDetails ? (
                <div>
                  <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
                    {/* Order Header */}
                    <div className="p-6 bg-emerald-50 border-b border-emerald-100">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                        <div>
                          <h1 className="text-2xl font-bold text-gray-800 mb-1">Order ECO-{orderDetails.id}</h1>
                          <p className="text-sm text-gray-600">Placed on {orderDetails.date}</p>
                        </div>
                        <div className="mt-4 sm:mt-0">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(orderDetails.status)}`}>
                            <span className="h-2 w-2 rounded-full mr-2" style={{ backgroundColor: 'currentColor' }}></span>
                            {orderDetails.status
                              ? orderDetails.status.charAt(0).toUpperCase() + orderDetails.status.slice(1)
                              : 'Unknown'}
                          </span>
                        </div>
                      </div>

                      {/* Tracking Info (if available) */}
                      {orderDetails.trackingNumber && (
                        <div className="mt-4 p-4 bg-white rounded-lg border border-emerald-100">
                          <div className="flex flex-col sm:flex-row sm:justify-between">
                            <div>
                              <h3 className="text-sm font-medium text-gray-700">Tracking Number</h3>
                              <p className="text-sm text-gray-600">{orderDetails.trackingNumber}</p>
                            </div>
                            <div className="mt-2 sm:mt-0">
                              <h3 className="text-sm font-medium text-gray-700">Estimated Delivery</h3>
                              <p className="text-sm text-gray-600">{orderDetails.estimatedDelivery}</p>
                            </div>
                            <div className="mt-3 sm:mt-0">

                              <button
                                className="text-sm font-medium text-emerald-600 hover:text-emerald-500"
                                onClick={() => {
                                  alert('Track package functionality would go here');
                                }}
                              >
                                Track Package
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Order Items */}
                    <div className="p-6 border-b border-gray-200">
                      <h2 className="text-lg font-medium text-gray-800 mb-4">Order Items</h2>

                      <div className="divide-y divide-gray-200">
                        {orderDetails.items.map(item => (
                          <div key={item.id} className="py-4 flex items-center">
                            <div className="flex-shrink-0 h-16 w-16 bg-gray-100 rounded-md overflow-hidden mr-4">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={item.imageUrl.startsWith('http') ? item.imageUrl : `http://localhost:8000${item.imageUrl}`}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-medium text-gray-800">{item.name}</h3>
                              <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
                              <p className="text-xs text-gray-500">{formatCurrency(item.price)} each</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Shipping & Payment Info */}
                      <div>
                        <div className="mb-6">
                          <h3 className="text-sm font-medium text-gray-700 mb-2">Shipping Address</h3>
                          <address className="text-sm text-gray-600 not-italic">
                            {orderDetails.shipping.name}<br />
                            {orderDetails.shipping.address}<br />
                            {orderDetails.shipping.city}, {orderDetails.shipping.state} {orderDetails.shipping.postalCode}<br />
                            {orderDetails.shipping.country}
                          </address>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-700 mb-2">Payment Method</h3>
                          <p className="text-sm text-gray-600">
                            {orderDetails.payment.method}
                            {orderDetails.payment.last4 && ` ending in ${orderDetails.payment.last4}`}
                          </p>
                        </div>
                      </div>

                      {/* Order Totals */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Order Summary</h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex justify-between mb-2">
                            <span className="text-sm text-gray-600">Subtotal</span>
                            <span className="text-sm text-gray-800">{formatCurrency(orderDetails.subtotal)}</span>
                          </div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm text-gray-600">Shipping</span>
                            <span className="text-sm text-gray-800">{formatCurrency(orderDetails.shippingCost)}</span>
                          </div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm text-gray-600">Tax</span>
                            <span className="text-sm text-gray-800">{formatCurrency(orderDetails.tax)}</span>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-gray-200 mt-2">
                            <span className="text-sm font-medium text-gray-800">Total</span>
                            <span className="text-sm font-medium text-emerald-600">{formatCurrency(orderDetails.total)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <button
                      onClick={() => window.print()}
                      className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                      Print Receipt
                    </button>

                    <div className="flex gap-4">
                      <button
                        onClick={() => {
                          alert('Need help? Contact support at support@ecocycle.com');
                        }}
                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-emerald-700 bg-emerald-100 hover:bg-emerald-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                      >
                        Need Help?
                      </button>

                      <Link
                        href="/products"
                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                      >
                        Continue Shopping
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-8 rounded-lg shadow-md text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Order Not Found</h3>
                  <p className="text-gray-600 mb-6">
                    We couldn't find the order you're looking for. It may have been removed or the ID is incorrect.
                  </p>
                  <Link
                    href="/account/orders"
                    className="inline-flex items-center justify-center px-5 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 transition-colors duration-200"
                  >
                    Return to Orders
                  </Link>
                </div>
              )}
            </div>
          </main>
          <Footer />
        </div>
      </>
    </AuthCheck>
  );
};

export default OrderDetailsPage;