"use client";

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Head from 'next/head';
import { useParams, useRouter } from 'next/navigation';

type Product = {
  id: number;
  name: string;
  description: string;
  price: number | string;  
  stock: number;
  image?: string;
};

const ProductDetailPage = () => {
  const params = useParams();
  const id = params?.id;
  
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const storedId = localStorage.getItem('userId');
    if (storedId) {
      setUserId(parseInt(storedId));
    }
  }, []);

  useEffect(() => {
    if (!id) return;

    fetch(`http://127.0.0.1:8000/products/${id}/`)
      .then(res => {
        if (!res.ok) {
          return res.text().then(text => { throw new Error(text); });
        }
        return res.json();
      })
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const handleQuantityChange = (value: number) => {
    if (product && value >= 1 && value <= product.stock) {
      setQuantity(value);
    }
  };

  const handleAddToCart = () => {
    if (!userId) {
      alert('Please log in before adding items to your cart.');
      return;
    }

    if (product) {
      const cartItem = {
        user_id: userId,
        product_id: product.id,
        quantity,
      };

      fetch('http://127.0.0.1:8000/add-to-cart/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cartItem),
      })
        .then(async res => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Failed to add to cart');
          return data;
        })
        .then(() => {
          router.push('/checkout');
        })
        .catch(err => {
          console.error("Error adding to cart:", err);
          alert("Something went wrong while adding to cart: " + err.message);
        });
    }
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (error) return <div className="text-center py-20">Error: {error}</div>;
  if (!product) return <div className="text-center py-20">Product not found.</div>;

  const formattedPrice = typeof product.price === 'number' 
    ? product.price.toFixed(2) 
    : parseFloat(String(product.price)).toFixed(2);

  return (
    <>
      <Head>
        <title>{product.name} - EcoCycle</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className="flex flex-col min-h-screen bg-gray-100">
        <Header />
        <main className="flex-grow">
          <section className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="h-64 sm:h-80 md:h-96 flex justify-center items-center overflow-hidden rounded-lg shadow">
                {product.image ? (
                  <img
                    src={`http://127.0.0.1:8000${product.image}`}
                    alt={product.name}
                    className="max-h-full object-contain"
                  />
                ) : (
                  <span className="text-gray-400">No image available</span>
                )}
              </div>

              <div className="px-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-emerald-600 mb-4">{product.name}</h1>
                <p className="text-sm sm:text-base text-gray-700 mb-6">{product.description}</p>
                <p className="text-xl sm:text-2xl font-semibold text-emerald-600 mb-4">฿{formattedPrice}</p>
                <p className="text-sm sm:text-base text-gray-700 mb-6">Available: {product.stock}</p>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex items-center w-full sm:w-auto">
                    <button
                      className="px-3 sm:px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-l"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                    >-</button>
                    <span className="px-3 sm:px-4 py-2 bg-white text-center min-w-[40px] sm:min-w-[50px] text-gray-700">{quantity}</span>
                    <button
                      className="px-3 sm:px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-r"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= product.stock}
                    >+</button>
                  </div>

                  <button
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-center"
                    onClick={handleAddToCart}
                    disabled={quantity <= 0 || product.stock <= 0}
                  >
                    {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default ProductDetailPage;
