'use client';

import Image from 'next/image';
import { useState } from 'react';

export interface MenuItem {
  id:          string;
  name:        string;
  description: string;
  price:       number;
  image:       string;
  badge?:      string; // e.g. "Popular", "New", "Chef's Pick"
}

interface MenuItemCardProps {
  item:       MenuItem;
  onAddToCart: (item: MenuItem, qty: number) => void;
}

export default function MenuItemCard({ item, onAddToCart }: MenuItemCardProps) {
  const [qty, setQty] = useState(0);
  const [added, setAdded] = useState(false);

  const decrement = () => setQty((q) => Math.max(0, q - 1));
  const increment = () => setQty((q) => q + 1);

  const handleAddToCart = () => {
    const finalQty = qty === 0 ? 1 : qty;
    onAddToCart(item, finalQty);
    setAdded(true);
    setQty(0);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <article
      id={`menu-item-${item.id}`}
      className="gradient-border-card flex flex-col overflow-hidden group"
      style={{ background: '#1a2130' }}
    >
      {/* Image container */}
      <div className="relative w-full aspect-[4/3] overflow-hidden">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* Glossy overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 50%, rgba(0,0,0,0.3) 100%)',
          }}
          aria-hidden="true"
        />

        {/* Badge */}
        {item.badge && (
          <span
            className="
              absolute top-3 left-3
              px-2.5 py-1 rounded-full
              text-[10px] font-bold uppercase tracking-wider
              bg-gradient-to-r from-amber-500 to-orange-600
              text-white shadow-md
            "
          >
            {item.badge}
          </span>
        )}

        {/* Price chip */}
        <span
          className="
            absolute top-3 right-3
            px-3 py-1.5 rounded-full
            glass
            text-sm font-bold
            text-amber-400
            border border-amber-400/20
          "
        >
          ${item.price.toFixed(2)}
        </span>
      </div>

      {/* Card body */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Name & description */}
        <div className="flex-1">
          <h3 className="font-bold text-slate-100 text-base leading-snug">{item.name}</h3>
          <p className="text-slate-500 text-sm mt-1 leading-relaxed line-clamp-2">{item.description}</p>
        </div>

        {/* Quantity + CTA row */}
        <div className="flex items-center gap-3 pt-1">
          {/* Quantity stepper */}
          <div
            className="
              flex items-center gap-1
              bg-white/5 rounded-full
              border border-white/10 p-0.5
            "
            role="group"
            aria-label={`Quantity for ${item.name}`}
          >
            <button
              onClick={decrement}
              id={`qty-dec-${item.id}`}
              aria-label="Decrease quantity"
              disabled={qty === 0}
              className="
                w-8 h-8 rounded-full flex items-center justify-center
                text-slate-400
                hover:bg-white/10 hover:text-slate-100
                disabled:opacity-30 disabled:cursor-not-allowed
                transition-all duration-150
                font-bold text-lg leading-none
              "
            >
              −
            </button>
            <span
              className="w-6 text-center text-sm font-semibold text-slate-200 select-none tabular-nums"
              aria-live="polite"
            >
              {qty}
            </span>
            <button
              onClick={increment}
              id={`qty-inc-${item.id}`}
              aria-label="Increase quantity"
              className="
                w-8 h-8 rounded-full flex items-center justify-center
                text-slate-400
                hover:bg-white/10 hover:text-slate-100
                transition-all duration-150
                font-bold text-lg leading-none
              "
            >
              +
            </button>
          </div>

          {/* Add to cart button */}
          <button
            onClick={handleAddToCart}
            id={`add-cart-${item.id}`}
            aria-label={`Add ${item.name} to cart`}
            className={`
              flex-1 flex items-center justify-center gap-2
              py-2 rounded-full text-sm font-semibold
              transition-all duration-200
              ${added
                ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400'
                : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:opacity-90 hover:scale-[1.02] shadow shadow-orange-900/40'
              }
            `}
          >
            {added ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                Added!
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
