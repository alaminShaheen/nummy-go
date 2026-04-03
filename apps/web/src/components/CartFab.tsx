'use client';

import { useState } from 'react';
import Link from 'next/link';

interface CartFabProps {
  itemCount?: number;
}

export default function CartFab({ itemCount = 0 }: CartFabProps) {
  const [pulse, setPulse] = useState(false);

  return (
    <Link
      href="/cart"
      id="cart-fab"
      aria-label={`View cart – ${itemCount} item${itemCount !== 1 ? 's' : ''}`}
      onMouseEnter={() => setPulse(true)}
      onAnimationEnd={() => setPulse(false)}
      className={`
        fixed bottom-6 right-6 z-50 flex items-center gap-2
        px-5 py-3 rounded-full
        bg-gradient-to-r from-amber-500 to-orange-600
        text-white font-semibold text-sm shadow-lg shadow-orange-900/40
        hover:scale-105 hover:shadow-xl hover:shadow-orange-900/60
        transition-all duration-200 ease-out
        ${pulse ? 'animate-bounce' : ''}
      `}
    >
      {/* Cart icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>

      <span className="hidden sm:inline">View Cart</span>

      {/* Badge */}
      {itemCount > 0 && (
        <span
          className="
            flex items-center justify-center
            w-5 h-5 rounded-full
            bg-white text-orange-600
            text-xs font-bold leading-none
            shadow
          "
        >
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </Link>
  );
}
