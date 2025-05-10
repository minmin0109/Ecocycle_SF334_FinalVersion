// ProductGrid.tsx
"use client";
import React from 'react';
import Link from 'next/link';

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    available: number;
    imageUrl: string;
}

interface ProductGridProps {
    products: Product[];
}

const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
    const addToCart = (product: Product) => {
        const existingCart = localStorage.getItem('cart');
        const cart = existingCart ? JSON.parse(existingCart) : [];

        const existingItemIndex = cart.findIndex((item: any) => item.id === product.id);

        if (existingItemIndex !== -1) {
            if (cart[existingItemIndex].quantity < cart[existingItemIndex].available) {
                cart[existingItemIndex].quantity += 1;
            }
        } else {
            cart.push({
                ...product,
                quantity: 1,
            });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        alert('Added to cart!');
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-8">
            {products.map((product) => (
                <div
                    key={product.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden transition-transform transform hover:-translate-y-1 hover:shadow-lg"
                >
                    <div className="h-48 bg-gray-100 flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={product.imageUrl} alt={product.name} className="object-contain h-full" />
                    </div>
                    <div className="p-6 flex flex-col gap-2">
                        <Link href={`/products/${product.id}`}>
                            <h3 className="text-lg font-semibold text-emerald-600 line-clamp-2 cursor-pointer hover:underline">
                                {product.name}
                            </h3>
                        </Link>
                        <p className="text-gray-600 text-sm line-clamp-3">{product.description}</p>
                        <p className="text-emerald-600 font-bold text-md">${product.price.toFixed(2)}</p>

                        <button
                            onClick={() => addToCart(product)}
                            className="mt-2 w-full px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md text-sm"
                        >
                            Add to Cart
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ProductGrid;
