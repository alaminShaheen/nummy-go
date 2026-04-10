'use client';

import { ShoppingCart } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useCart } from '@/hooks/useCart';
import CartDrawer from './CartDrawer';
import { cn } from '@/lib/utils';

export default function CartFab() {
  const { totalItems, megaTotal } = useCart();
  const prevCount = useRef(totalItems);
  const [bump, setBump] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    if (totalItems > prevCount.current) {
      setBump(true);
      const t = setTimeout(() => setBump(false), 450);
      prevCount.current = totalItems;
      return () => clearTimeout(t);
    }
    prevCount.current = totalItems;
  }, [totalItems]);

  if (totalItems === 0) return null;

  return (
    <>
      <button
        onClick={() => setIsDrawerOpen(true)}
        id="cart-fab"
        aria-label={`View cart – ${totalItems} item${totalItems !== 1 ? 's' : ''}`}
        className={cn(
          "fixed z-[60] flex items-center justify-between gap-3",
          "bottom-6 left-[3%] w-[94%] sm:left-auto sm:right-6 sm:w-auto",
          "pl-4 pr-3 py-3 rounded-[2rem]",
          "bg-[rgba(10,13,20,0.85)] sm:bg-gradient-to-r sm:from-amber-500 sm:to-orange-600",
          "backdrop-blur-xl border sm:border-none border-amber-500/20",
          "text-white font-bold text-sm",
          "shadow-[0_0_40px_rgba(245,158,11,0.2)]",
          "hover:scale-[1.02] active:scale-95 transition-all duration-300",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60",
          bump ? 'scale-[1.03] shadow-[0_0_60px_rgba(245,158,11,0.5)]' : ''
        )}
      >
        <div className="flex flex-1 items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 sm:bg-white/20 flex items-center justify-center shrink-0">
            <ShoppingCart size={16} aria-hidden="true" className="text-amber-400 sm:text-white" />
          </div>

          <div className="flex flex-col text-left">
            <span className="text-white text-[13px] leading-tight">
              <span className="sm:hidden">{totalItems} Item{totalItems !== 1 ? 's' : ''} in Cart</span>
              <span className="hidden sm:inline">View Cart</span>
            </span>
          </div>
        </div>

        {/* Action / Price Badge */}
        <div className="flex items-center gap-2">
          <span className="sm:hidden font-black text-amber-400 text-sm tracking-wide">
            ${megaTotal.toFixed(2)}
          </span>
          <span className={cn(
            "flex items-center justify-center px-4 h-9 rounded-full",
            "bg-gradient-to-r from-amber-500 to-orange-500 text-black text-xs font-black uppercase tracking-widest",
            "sm:hidden"
          )}>
            Checkout <span className="ml-1 text-black/60">→</span>
          </span>

          {/* Desktop pure item count pill */}
          <span className={cn(
            "hidden sm:flex items-center justify-center min-w-[24px] h-[24px] px-2 rounded-full",
            "bg-white text-orange-600 text-xs font-black leading-none shadow-sm transition-transform duration-200",
            bump ? "scale-125" : "scale-100"
          )}>
            {totalItems > 99 ? '99+' : totalItems}
          </span>
        </div>
      </button>

      <CartDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} anchor="bottom" />
    </>
  );
}
