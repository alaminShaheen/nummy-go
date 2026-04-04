'use client';

import Link from 'next/link';
import { GradientButton } from '@/components/ui';
import { ShoppingCart } from 'lucide-react';

interface CartFabProps {
  itemCount?: number;
}

export default function CartFab({ itemCount = 0 }: CartFabProps) {
  return (
    <GradientButton
      id="cart-fab"
      aria-label={`View cart – ${itemCount} item${itemCount !== 1 ? 's' : ''}`}
      className="fixed bottom-6 right-6 z-50 shadow-lg shadow-orange-900/40 hover:shadow-xl hover:shadow-orange-900/60"
      onClick={() => { window.location.href = '/cart'; }}
    >
      <ShoppingCart size={20} aria-hidden="true" />
      <span className="hidden sm:inline">View Cart</span>

      {/* Badge */}
      {itemCount > 0 && (
        <span
          className="flex items-center justify-center w-5 h-5 rounded-full bg-white text-orange-600 text-xs font-bold leading-none shadow"
        >
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </GradientButton>
  );
}
