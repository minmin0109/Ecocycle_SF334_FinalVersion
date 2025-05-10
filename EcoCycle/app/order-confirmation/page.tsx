// Order Confirmation Page Component
"use client"
import Footer from '@/components/Footer';
import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';

interface OrderSummary {
  customer_email: string;
  orderId: string;
  orderDate: string;
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
    imageUrl: string;
  }[];
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
  estimatedDelivery: string;
}

const OrderConfirmationPage = () => {
  const router = useRouter();
  const [orderDetails, setOrderDetails] = useState<OrderSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  if (!orderId) {
    console.error("Missing orderId in URL.");
    setLoading(false);
    return;
  }

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    fetch(`http://127.0.0.1:8000/order/${orderId}/confirmation/`)
      .then(res => res.json())
      .then(data => {
        setOrderDetails(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading order confirmation:", err);
        setLoading(false);
      });
  }, [orderId]);


  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Processing your order...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center p-12">
            <p className="text-red-500 mb-4">Unable to retrieve order details.</p>
            <Link href="/" className="text-emerald-600 hover:text-emerald-700 font-medium">
              Return to Home
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
        <title>Order Confirmation - EcoCycle</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className="flex flex-col min-h-screen bg-gray-50">
        <main className="flex-grow">
          <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-emerald-100 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Thank You For Your Order!</h1>
              <p className="text-gray-600">Your order has been received and is now being processed.</p>
              <p className="text-gray-600">
                We've sent a confirmation email to <span className="font-medium">{orderDetails.customer_email}</span>
              </p>


            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
              <div className="p-6 bg-emerald-50 border-b border-emerald-100">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">Order ECO - {orderDetails.orderId}</h2>
                    <p className="text-sm text-gray-600">Placed on {orderDetails.orderDate}</p>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 mr-2"></span>
                      Order Confirmed
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex flex-col md:flex-row md:space-x-8">
                  {/* Order Summary */}
                  <div className="flex-1 mb-6 md:mb-0">
                    <h3 className="font-bold text-gray-800 mb-4">Order Summary</h3>
                    <div className="space-y-4">
                      {orderDetails.items.map(item => (
                        <div key={item.id} className="flex items-start">
                          <div className="flex-shrink-0 h-16 w-16 bg-gray-100 rounded-md overflow-hidden mr-4">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={`http://127.0.0.1:8000${item.imageUrl}`}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-800">{item.name}</h4>
                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-800">{(item.price * item.quantity).toFixed(2)} ฿ </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="text-gray-800">{orderDetails.subtotal.toFixed(2)} ฿</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Shipping</span>
                        <span className="text-gray-800">{orderDetails.shippingCost.toFixed(2)} ฿</span>
                      </div>
                      <div className="flex justify-between mb-4">
                        <span className="text-gray-600">Tax</span>
                        <span className="text-gray-800">{orderDetails.tax.toFixed(2)} ฿</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg">
                        <span className="text-gray-800">Total</span>
                        <span className="text-emerald-600">{orderDetails.total.toFixed(2)} ฿</span>
                      </div>
                    </div>
                  </div>

                  {/* Shipping & Payment Info */}
                  <div className="flex-1">
                    <div className="mb-6">
                      <h3 className="font-bold text-gray-800 mb-4">Shipping Information</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="font-medium text-gray-800">{orderDetails.shipping.name}</p>
                        <p className="text-gray-600">{orderDetails.shipping.address}</p>
                        <p className="text-gray-600">
                          {orderDetails.shipping.city}, {orderDetails.shipping.state} {orderDetails.shipping.postalCode}
                        </p>
                        <p className="text-gray-600">{orderDetails.shipping.country}</p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h3 className="font-bold text-gray-800 mb-4">Payment Method</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="flex items-center text-gray-800">
                          {orderDetails.payment.method.toLowerCase() === 'paypal' ? (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.494a.64.64 0 0 1 .632-.543h6.964c2.075 0 3.747.517 4.757 1.501.957.945 1.222 2.089.82 3.854-.08.357-.218.732-.393 1.108a.637.637 0 0 1-.13.207l.018-.013c1.071 1.156 1.515 2.498 1.317 4.016-.22 1.687-.937 3.103-2.14 4.215-1.219 1.13-2.892 1.689-5.096 1.689H8.55l-.262 1.69a.638.638 0 0 1-.63.536H7.076v.01z" />
                              </svg>
                              PayPal
                            </>
                          ) : (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500 mr-2" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M4 4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H4zm0 2h16v2H4V6zm0 4h16v8H4v-8z" />
                              </svg>
                              Credit Card {orderDetails.payment.last4 ? `(**** **** **** ${orderDetails.payment.last4})` : ''}
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-800 mb-4">Estimated Delivery</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-800">{orderDetails.estimatedDelivery}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4">
              <Link
                href="/products"
                className="bg-white text-emerald-600 font-medium py-3 px-6 rounded-lg border border-emerald-200 hover:bg-emerald-50 transition-colors duration-200 text-center"
              >
                Continue Shopping
              </Link>
              <Link
                href="/account/orders"
                className="bg-emerald-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-emerald-700 transition-colors duration-200 text-center"
              >
                View All Orders
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default OrderConfirmationPage;