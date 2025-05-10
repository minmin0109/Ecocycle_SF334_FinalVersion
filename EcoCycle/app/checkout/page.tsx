// Checkout Page Component (Merged with Backend Data Fetch)
"use client"
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Head from 'next/head';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Define interfaces
interface OrderItem {
  id: string;           
  productId: number;    
  name: string;
  quantity: number;
  price: number;
  imageUrl: string;
}

interface AddressInfo {
  fullName: string;
  address: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
  phoneNumber: string;
}

interface CardInfo {
  cardNumber: string;
  cardholderName: string;
  expirationDate: string;
  cvc: string;
}

const CheckoutPage = () => {
  const router = useRouter();

  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  const [shippingInfo, setShippingInfo] = useState<AddressInfo>({
    fullName: '',
    address: '',
    city: '',
    stateProvince: '',
    postalCode: '',
    country: '',
    phoneNumber: ''
  });

  const [billingInfo, setBillingInfo] = useState<AddressInfo>({
    fullName: '',
    address: '',
    city: '',
    stateProvince: '',
    postalCode: '',
    country: '',
    phoneNumber: ''
  });

  const [cardInfo, setCardInfo] = useState<CardInfo>({
    cardNumber: '',
    cardholderName: '',
    expirationDate: '',
    cvc: ''
  });

  const [sameAsShipping, setSameAsShipping] = useState<boolean>(true);
  const [paymentMethod, setPaymentMethod] = useState<string>('paypal');

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (!storedUserId) return;
  
    fetch(`${baseUrl}/cart/${storedUserId}/`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch cart');
        return res.json();
      })
      .then(data => {
        const items = data.map((item: any) => {
          const imgUrl = item.imageUrl?.startsWith('/')
            ? `${baseUrl}${item.imageUrl}`
            : item.imageUrl;
  
          return {
            id: item.id, 
            productId: item.productId, 
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            imageUrl: imgUrl
          };
        });
        setOrderItems(items);
      })
      .catch(err => {
        console.error('Cart load error:', err);
      });
  }, []); 
  
  

  const handleRemoveItem = async (itemId: string) => {
    const storedUserId = localStorage.getItem('userId');
    if (!storedUserId) return;

    try {
      const res = await fetch(`${baseUrl}/cart/${storedUserId}/remove/${itemId}/`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setOrderItems(prev => prev.filter(item => item.id !== itemId));
      } else {
        console.error('Failed to remove item');
      }
    } catch (err) {
      console.error('Remove error:', err);
    }
  };

  const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 5.00;
  const taxes = subtotal * 0.1;
  const total = subtotal + shipping + taxes;

  const handleShippingInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
    if (sameAsShipping) setBillingInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleBillingInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBillingInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleCardInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSameAsShippingChange = () => {
    const newValue = !sameAsShipping;
    setSameAsShipping(newValue);
    if (newValue) setBillingInfo(shippingInfo);
  };

  const validateCheckout = (): boolean => {
    if (!shippingInfo.fullName || !shippingInfo.address || !shippingInfo.city ||
      !shippingInfo.postalCode || !shippingInfo.country || !shippingInfo.phoneNumber) {
      alert('Please fill in all shipping address information');
      return false;
    }
    if (!sameAsShipping) {
      if (!billingInfo.fullName || !billingInfo.address || !billingInfo.city ||
        !billingInfo.postalCode || !billingInfo.country || !billingInfo.phoneNumber) {
        alert('Please fill in all billing address information');
        return false;
      }
    }
    if (paymentMethod === 'creditCard') {
      if (!cardInfo.cardNumber || !cardInfo.cardholderName || !cardInfo.expirationDate || !cardInfo.cvc) {
        alert('Please fill in all credit card information');
        return false;
      }
    }
    return true;
  };

  const handleCheckout = async () => {
    if (!validateCheckout()) return;

    const payload = {
      userId: localStorage.getItem('userId'),
      shippingInfo,
      billingInfo: sameAsShipping ? shippingInfo : billingInfo,
      paymentMethod,
      paymentDetails: paymentMethod === 'creditCard' ? cardInfo : null,
      items: orderItems.map(({ productId, quantity, price }) => ({
        id: productId,  
        quantity,
        price,
      })),
      subtotal,
      shipping,
      taxes,
      total
    };

    try {
      const response = await fetch(`${baseUrl}/checkout/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const responseData = await response.json();

      if (!response.ok) {
        let errorMessage = 'Unable to complete order';
        if (responseData.error) errorMessage += `: ${responseData.error}`;
        if (responseData.details && Array.isArray(responseData.details)) {
          errorMessage += `\n\nDetails:\n${responseData.details.join('\n')}`;
        }
        alert(errorMessage);
        throw new Error(errorMessage);
      }

      const storedUserId = localStorage.getItem('userId');
      if (storedUserId) {
        await fetch(`${baseUrl}/cart/${storedUserId}/clear/`, {
          method: 'POST'
        });
        setOrderItems([]);
      }

      localStorage.setItem('lastOrder', JSON.stringify(payload));
      alert('Order completed successfully!');
      router.push(`/order-confirmation?orderId=${responseData.order_id}`);
    } catch (error) {
      console.error('Checkout error:', error);
    }
  };

  const inputClassName = "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-gray-800 font-medium";
  const labelClassName = "block text-sm font-medium text-gray-700 mb-1";
  
  return (
    <>
      <Head>
        <title>Checkout - EcoCycle</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <main className="flex-grow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-4xl font-bold text-center text-emerald-600 mb-6">Checkout</h1>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-10"></div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Left Column: Shipping & Payment */}
                <div className="p-6 md:p-10 bg-gradient-to-br from-gray-50 to-white">
                  {/* Shipping Address Section */}
                  <div className="mb-10">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                      <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-emerald-100 text-emerald-600 mr-3 text-lg">1</span>
                      Shipping Address
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                      <div className="md:col-span-2">
                        <label className={labelClassName}>Full name</label>
                        <input
                          type="text"
                          name="fullName"
                          value={shippingInfo.fullName}
                          onChange={handleShippingInfoChange}
                          className={inputClassName}
                          placeholder="John Doe"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className={labelClassName}>Address</label>
                        <input
                          type="text"
                          name="address"
                          value={shippingInfo.address}
                          onChange={handleShippingInfoChange}
                          className={inputClassName}
                          placeholder="123 Main St"
                        />
                      </div>

                      <div>
                        <label className={labelClassName}>City</label>
                        <input
                          type="text"
                          name="city"
                          value={shippingInfo.city}
                          onChange={handleShippingInfoChange}
                          className={inputClassName}
                          placeholder="San Francisco"
                        />
                      </div>

                      <div>
                        <label className={labelClassName}>State/Province</label>
                        <input
                          type="text"
                          name="stateProvince"
                          value={shippingInfo.stateProvince}
                          onChange={handleShippingInfoChange}
                          className={inputClassName}
                          placeholder="Alabama"
                        />
                      </div>

                      <div>
                        <label className={labelClassName}>Postal Code</label>
                        <input
                          type="text"
                          name="postalCode"
                          value={shippingInfo.postalCode}
                          onChange={handleShippingInfoChange}
                          className={inputClassName}
                          placeholder="94103"
                        />
                      </div>

                      <div>
                        <label className={labelClassName}>Country</label>
                        <input
                          type="text"
                          name="country"
                          value={shippingInfo.country}
                          onChange={handleShippingInfoChange}
                          className={inputClassName}
                          placeholder="United States"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className={labelClassName}>Phone Number</label>
                        <input
                          type="tel"
                          name="phoneNumber"
                          value={shippingInfo.phoneNumber}
                          onChange={handleShippingInfoChange}
                          className={inputClassName}
                          placeholder="(555) 555-5555"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Billing Address Section */}
                  <div className="mb-10">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                      <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-emerald-100 text-emerald-600 mr-3 text-lg">2</span>
                      Billing Address
                    </h2>

                    <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          id="sameAsShipping"
                          checked={sameAsShipping}
                          onChange={handleSameAsShippingChange}
                          className="h-5 w-5 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <span className="ml-3 text-gray-700 font-medium">
                          Billing address is the same as shipping address
                        </span>
                      </label>
                    </div>

                    {/* Show billing form if not same as shipping */}
                    {!sameAsShipping && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="md:col-span-2">
                          <label className={labelClassName}>Full name</label>
                          <input
                            type="text"
                            name="fullName"
                            value={billingInfo.fullName}
                            onChange={handleBillingInfoChange}
                            className={inputClassName}
                            placeholder="John Doe"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className={labelClassName}>Address</label>
                          <input
                            type="text"
                            name="address"
                            value={billingInfo.address}
                            onChange={handleBillingInfoChange}
                            className={inputClassName}
                            placeholder="123 Main St"
                          />
                        </div>

                        <div>
                          <label className={labelClassName}>City</label>
                          <input
                            type="text"
                            name="city"
                            value={billingInfo.city}
                            onChange={handleBillingInfoChange}
                            className={inputClassName}
                            placeholder="San Francisco"
                          />
                        </div>

                        <div>
                          <label className={labelClassName}>State/Province</label>
                          <input
                            type="text"
                            name="stateProvince"
                            value={billingInfo.stateProvince}
                            onChange={handleBillingInfoChange}
                            className={inputClassName}
                            placeholder="Alabama"
                          />
                        </div>

                        <div>
                          <label className={labelClassName}>Postal Code</label>
                          <input
                            type="text"
                            name="postalCode"
                            value={billingInfo.postalCode}
                            onChange={handleBillingInfoChange}
                            className={inputClassName}
                            placeholder="94103"
                          />
                        </div>

                        <div>
                          <label className={labelClassName}>Country</label>
                          <input
                            type="text"
                            name="country"
                            value={billingInfo.country}
                            onChange={handleBillingInfoChange}
                            className={inputClassName}
                            placeholder="United States"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className={labelClassName}>Phone Number</label>
                          <input
                            type="tel"
                            name="phoneNumber"
                            value={billingInfo.phoneNumber}
                            onChange={handleBillingInfoChange}
                            className={inputClassName}
                            placeholder="(555) 555-5555"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Payment Method Section */}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                      <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-emerald-100 text-emerald-600 mr-3 text-lg">3</span>
                      Payment Method
                    </h2>

                    <div className="space-y-4">
                      <div className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <input
                          type="radio"
                          id="paypal"
                          name="paymentMethod"
                          value="paypal"
                          checked={paymentMethod === 'paypal'}
                          onChange={() => setPaymentMethod('paypal')}
                          className="h-5 w-5 text-emerald-600 focus:ring-emerald-500"
                        />
                        <label htmlFor="paypal" className="ml-3 flex items-center">
                          <span className="text-gray-700 font-medium mr-2">PayPal</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.494a.64.64 0 0 1 .632-.543h6.964c2.075 0 3.747.517 4.757 1.501.957.945 1.222 2.089.82 3.854-.08.357-.218.732-.393 1.108a.637.637 0 0 1-.13.207l.018-.013c1.071 1.156 1.515 2.498 1.317 4.016-.22 1.687-.937 3.103-2.14 4.215-1.219 1.13-2.892 1.689-5.096 1.689H8.55l-.262 1.69a.638.638 0 0 1-.63.536H7.076v.01zM11.98 9.95c-.234.888-.638 1.593-1.243 2.099-.711.595-1.655.825-2.972.825h-.946l.922-5.944h.967c1.118 0 1.904.134 2.317.593.436.486.493 1.284.195 2.428zm1.169-5.819h-6.42l-.612 3.933h.612c1.664.001 2.834-.349 3.666-1.036.859-.708 1.44-1.754 1.767-3.097a.638.638 0 0 0-.623-.8h-1.39a.64.64 0 0 0-.614.484l-.228.838a.634.634 0 0 1-.615.484H6.524a.64.64 0 0 1-.626-.77l.326-1.827a.64.64 0 0 1 .626-.509h6.3c.427 0 .729.416.615.832l-.17.667a.64.64 0 0 0 .623.801z" />
                          </svg>
                        </label>
                      </div>

                      <div className="flex flex-col p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center mb-4">
                          <input
                            type="radio"
                            id="creditCard"
                            name="paymentMethod"
                            value="creditCard"
                            checked={paymentMethod === 'creditCard'}
                            onChange={() => setPaymentMethod('creditCard')}
                            className="h-5 w-5 text-emerald-600 focus:ring-emerald-500"
                          />
                          <label htmlFor="creditCard" className="ml-3 flex items-center">
                            <span className="text-gray-700 font-medium mr-2">Credit Card</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M4 4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H4zm0 2h16v2H4V6zm0 4h16v8H4v-8z" />
                            </svg>
                          </label>
                        </div>

                        {paymentMethod === 'creditCard' && (
                          <div className="mt-2 pt-4 border-t border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                              <div className="md:col-span-2">
                                <label className={labelClassName}>
                                  Card number
                                </label>
                                <input
                                  type="text"
                                  name="cardNumber"
                                  value={cardInfo.cardNumber}
                                  onChange={handleCardInfoChange}
                                  className={inputClassName}
                                  placeholder="1234 5678 9012 3456"
                                />
                              </div>

                              <div className="md:col-span-2">
                                <label className={labelClassName}>
                                  Cardholder name
                                </label>
                                <input
                                  type="text"
                                  name="cardholderName"
                                  value={cardInfo.cardholderName}
                                  onChange={handleCardInfoChange}
                                  className={inputClassName}
                                  placeholder="John Doe"
                                />
                              </div>

                              <div>
                                <label className={labelClassName}>
                                  Expiration date
                                </label>
                                <input
                                  type="text"
                                  name="expirationDate"
                                  value={cardInfo.expirationDate}
                                  onChange={handleCardInfoChange}
                                  className={inputClassName}
                                  placeholder="MM/YY"
                                />
                              </div>

                              <div>
                                <label className={labelClassName}>
                                  CVC
                                </label>
                                <input
                                  type="text"
                                  name="cvc"
                                  value={cardInfo.cvc}
                                  onChange={handleCardInfoChange}
                                  className={inputClassName}
                                  placeholder="123"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Order Summary */}
                <div className="p-6 md:p-10 bg-gray-100 border-t lg:border-t-0 lg:border-l border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Order Summary</h2>

                  <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <h3 className="font-bold text-gray-700 mb-4 pb-2 border-b border-gray-200">Item List</h3>

                    <div className="space-y-4 max-h-80 overflow-y-auto mb-6 pr-2">
                      {orderItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-100">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-gray-100 rounded-md mr-4 overflow-hidden">
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // Fallback to placeholder on error
                                  e.currentTarget.src = 'https://via.placeholder.com/150';
                                }}
                              />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-800">{item.name}</h4>
                              <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="font-medium text-gray-800">
                              {(item.price * item.quantity).toFixed(2)} ฿
                            </span>
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-red-500 hover:text-red-700 text-sm font-medium"
                            >
                              delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <h3 className="font-bold text-gray-700 mb-4">Order Details</h3>

                      <div className="space-y-3">
                        <div className="flex justify-between text-gray-600">
                          <span>Subtotal</span>
                          <span>{subtotal.toFixed(2)} ฿ </span>
                        </div>

                        <div className="flex justify-between text-gray-600">
                          <span>Shipping</span>
                          <span>{shipping.toFixed(2)} ฿ </span>
                        </div>

                        <div className="flex justify-between text-gray-600">
                          <span>Taxes</span>
                          <span>{taxes.toFixed(2)} ฿ </span>
                        </div>

                        <div className="flex justify-between font-bold text-lg text-gray-800 pt-3 border-t border-gray-200">
                          <span>Total</span>
                          <span className="text-emerald-600">฿ {total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="font-bold text-gray-700 mb-3">Order Protection</h3>
                    <p className="text-sm text-gray-600 mb-4">All transactions are secure and encrypted. Your personal information is protected by industry-standard security protocols.</p>

                    <div className="flex space-x-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-gray-600">Secure Checkout</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Confirm Order Button */}
            <div className="flex justify-center mt-10">
              <button
                onClick={handleCheckout}
                className="px-10 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Confirm Order
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default CheckoutPage;