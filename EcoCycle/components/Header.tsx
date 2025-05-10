'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const Header = () => {
    const [userId, setUserId] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const id = localStorage.getItem('userId');
        setUserId(id);
    }, []);

    const goToCart = () => {
        if (userId) {
            router.push("/account/orders");
        } else {
            alert("Please log in to view your order.");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('userId');
        localStorage.removeItem('token');
        router.push("/account/login");
    };

    return (
        <header className="bg-white text-gray-800 py-4 shadow-md">
            <div className="container mx-auto flex justify-between items-center flex-wrap">
                <div className="flex items-center">
                    <img
                        src="/logo.png"
                        alt="EcoCycle Logo"
                        className="mr-4 h-10"
                        style={{ height: '70px', width: 'auto' }} 
                    />
                    <h1 className="text-2xl font-bold text-emerald-600">EcoCycle</h1>
                </div>
                <nav className="flex flex-wrap justify-center sm:justify-start">
                    <ul className="flex space-x-4 sm:space-x-6 flex-wrap">
                        <li>
                            <Link href="/products" className="hover:text-emerald-500 transition-colors whitespace-nowrap">
                                Products
                            </Link>
                        </li>

                        {userId && (
                            <>
                                <li>
                                    <button
                                        onClick={goToCart}
                                        className="hover:text-emerald-500 transition-colors whitespace-nowrap"
                                    >
                                        My order
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={handleLogout}
                                        className="hover:text-emerald-500 transition-colors whitespace-nowrap"
                                    >
                                        Log out
                                    </button>
                                </li>
                            </>
                        )}

                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;
