'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface CartFabProps {
  itemCount?: number;
}

export default function CartFab({ itemCount = 0 }: CartFabProps) {
  // Track previous count to animate when a new item is added
  const prevCount  = useRef(itemCount);
  const [bump, setBump] = useState(false);

  useEffect(() => {
    if (itemCount > prevCount.current) {
      setBump(true);
      const t = setTimeout(() => setBump(false), 450);
      prevCount.current = itemCount;
      return () => clearTimeout(t);
    }
    prevCount.current = itemCount;
  }, [itemCount]);

  return (
    <Link
      href="/cart"
      id="cart-fab"
      aria-label={`View cart – ${itemCount} item${itemCount !== 1 ? 's' : ''}`}
      className="
        fixed bottom-6 right-6 z-50
        flex items-center gap-2.5
        pl-4 pr-5 py-3
        rounded-full
        bg-gradient-to-r from-amber-500 to-orange-600
        text-white font-semibold text-sm
        shadow-lg shadow-orange-900/50
        hover:shadow-xl hover:shadow-orange-900/70
        hover:scale-105
        transition-all duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60
      "
    >
      {/* Cart icon */}
      <ShoppingCart size={18} aria-hidden="true" className="flex-shrink-0" />

      {/* Label */}
      <span className="hidden sm:block whitespace-nowrap">View Cart</span>

      {/* Item count badge — only shown when cart has items */}
      {itemCount > 0 && (
        <span
          aria-label={`${itemCount} items`}
          className={`
            flex items-center justify-center
            min-w-[22px] h-[22px] px-1.5
            rounded-full
            bg-white text-orange-600
            text-xs font-black leading-none
            shadow-sm
            transition-transform duration-200
            ${bump ? 'scale-125' : 'scale-100'}
          `}
          style={bump ? { animation: 'cart-badge-pop 0.4s cubic-bezier(0.34,1.56,0.64,1)' } : {}}
        >
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </Link>
  );
}
