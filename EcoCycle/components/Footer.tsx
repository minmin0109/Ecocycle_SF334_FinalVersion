import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-white text-gray-800 shadow-md py-8 border-t border-gray-200">
      <div className="container mx-auto text-center px-4">
        <div className="space-y-3 text-sm text-gray-600">
          <Link
            href="/contact"
            className="inline-block text-lg font-semibold text-emerald-600 hover:text-emerald-700 transition-colors duration-300 ease-in-out hover:underline focus:outline-none"
          >
            Contact Us
          </Link>

          <p>
            Email:{' '}
            <a
              href="mailto:support@ecocycle.com"
              className="text-emerald-600 hover:underline hover:text-emerald-700"
            >
              support@ecocycle.com
            </a>
          </p>
          <p>
             99 Moo 18 Paholyothin Road, Klong Nueng, Klong Luang, Pathumthani 12121
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
