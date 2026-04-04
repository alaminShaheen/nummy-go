'use client';

import { Button } from '@nummygo/shared/ui';
import { SectionLabel } from '@/components/ui';
import MenuItemCard, { type MenuItem } from './MenuItemCard';

interface MenuSectionProps {
  items:       MenuItem[];
  onAddToCart: (item: MenuItem, qty: number) => void;
}

const CATEGORIES = ['All', 'Mains', 'Pasta', 'Sushi', 'Desserts'];

export default function MenuSection({ items, onAddToCart }: MenuSectionProps) {
  return (
    <section id="menu" className="relative py-20 px-4 sm:px-6 lg:px-8">
      {/* Ambient glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <SectionLabel className="mb-2">Fresh Today</SectionLabel>
            <h2 className="text-4xl font-black text-slate-100">Our Menu</h2>
          </div>

          {/* Category pills */}
          <div className="flex gap-2 flex-wrap" role="tablist" aria-label="Menu categories">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat}
                role="tab"
                id={`cat-${cat.toLowerCase()}`}
                variant={cat === 'All' ? 'default' : 'outline'}
                size="sm"
                className={
                  cat === 'All'
                    ? 'rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white border-transparent hover:opacity-90'
                    : 'rounded-full bg-white/5 text-slate-400 border-white/10 hover:border-amber-400/30 hover:text-amber-400 dark:bg-white/5 dark:border-white/10'
                }
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map((item) => (
            <MenuItemCard key={item.id} item={item} onAddToCart={onAddToCart} />
          ))}
        </div>
      </div>
    </section>
  );
}
