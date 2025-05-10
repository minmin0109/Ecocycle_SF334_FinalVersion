"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Head from 'next/head';

type Product = {
    id: number;
    name: string;
    price: number;
    image?: string;
    category: string;
};

const ProductCard = ({ id, name, price, image, category }: Product) => {
    const router = useRouter();

    return (
        <div
            className="bg-white rounded-lg shadow p-4 cursor-pointer"
            onClick={() => router.push(`/products/${id}`)}
        >
            <div className="h-48 flex justify-center items-center border-b mb-4 overflow-hidden">
                {image ? (
                    <img
                        src={`http://127.0.0.1:8000${image}`}
                        alt={name || 'Product Image'}
                        className="object-cover h-full w-full"
                    />
                ) : (
                    <span className="text-gray-400">Image Placeholder</span>
                )}

            </div>
            <h2 className="text-lg font-semibold text-emerald-700">{name}</h2>
            <p className="text-emerald-700 font-bold">฿{`${parseFloat(price.toString()).toFixed(2)}`}</p>
            <p className="text-sm text-gray-600">Category: {category}</p>
        </div>
    );
};


const ProductGrid = ({ products }: { products: Product[] }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((product) => (
            <ProductCard key={product.id} {...product} />
        ))}
    </div>
);

const ProductPage = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetch('http://127.0.0.1:8000/products/')
            .then(res => res.json())
            .then(data => setProducts(data))
            .catch(err => console.error('Failed to load products:', err));
    }, []);

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <Head>
                <title>EcoCycle - Products</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&display=swap" rel="stylesheet" />
            </Head>

            <div className="flex flex-col min-h-screen bg-gray-100 font-[Playfair Display]">
            <Header />
                <main className="flex-grow">
                    <section className="container mx-auto py-10">
                        <div className="mb-10 flex justify-center items-center gap-3">
                            <input
                                type="text"
                                placeholder="Search eco-friendly products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full sm:w-[350px] px-5 py-3 rounded-2xl bg-white shadow-md border border-gray-200 text-gray-700 placeholder-gray-400 text-base focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all duration-300"
                            />
                            <button
                                className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-lg transition-transform duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-emerald-500"
                            >
                                Search
                            </button>
                        </div>

                        <ProductGrid products={filteredProducts} />
                    </section>
                </main>
                <Footer />
            </div>
        </>
    );
};

export default ProductPage;
