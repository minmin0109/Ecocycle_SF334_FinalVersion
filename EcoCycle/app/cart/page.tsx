"use client"
import Footer from '@/components/Footer';
import Head from 'next/head';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface CartItem {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  available: number;
  imageUrl: string;
}

const CartPage = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load cart from localStorage
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }

    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    setIsAuthenticated(authStatus);
  }, []);

  // Update localStorage when cartItems change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const handleQuantityChange = (id: string, newQuantity: number): void => {
    if (newQuantity >= 1) {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === id && newQuantity <= item.available
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    }
  };

  const removeItem = (id: string): void => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const cartTotal = cartItems.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0).toFixed(2);

  const formatPrice = (price: number): string => {
    return `${parseFloat(price.toString()).toFixed(2)}`;
  };

  return (
    <>
      <Head>
        <title>My Cart - EcoCycle</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className="flex flex-col min-h-screen bg-gray-50">
        <main className="flex-grow">
          <section className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-center mb-8 text-emerald-600">My Cart</h1>

            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
              {cartItems.length > 0 ? (
                <>
                  <div className="divide-y divide-gray-100">
                    {cartItems.map((item) => (
                      <div key={item.id} className="p-6 flex flex-row items-start gap-6">
                        <div className="w-24 flex-shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full rounded-md"
                          />
                        </div>

                        <div className="flex-grow mr-auto">
                          <h2 className="text-xl font-bold mb-2 text-gray-800">{item.name}</h2>
                          <p className="text-gray-600 mb-3 text-sm max-w-md">{item.description}</p>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-gray-400 hover:text-emerald-600 transition-colors duration-200 text-sm"
                          >
                            remove
                          </button>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <p className="text-xl font-bold text-emerald-600">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                          <p className="text-gray-500 text-xs">Available: {item.available}</p>

                          <div className="flex items-center border border-gray-200 rounded-md overflow-hidden">
                            <button
                              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700"
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              -
                            </button>
                            <span className="px-4 py-1 bg-white text-center min-w-[30px] text-gray-800">
                              {item.quantity}
                            </span>
                            <button
                              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700"
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.available}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-6 border-t border-gray-100 flex justify-between items-center">
                    <div className="w-1/3"></div>

                    <div className="w-1/3 flex justify-center">
                      <Link
                        href={isAuthenticated ? "/checkout" : "/account/login?returnUrl=/checkout"}
                        className="px-8 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-md transition-colors duration-200"
                      >
                        Checkout
                      </Link>
                    </div>

                    <div className="w-1/3 flex justify-end items-center">
                      <span className="mr-2 text-lg text-gray-700">Total:</span>
                      <span className="text-xl font-bold text-emerald-600">${cartTotal}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center">
                  <p className="mb-4 text-gray-600">Your cart is empty</p>
                  <Link href="/products" className="text-emerald-600 hover:text-emerald-700 hover:underline transition-colors duration-200">
                    Continue Shopping
                  </Link>
                </div>
              )}
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default CartPage;
