'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';
import { SectionLabel } from '@/components/ui';
import MenuItemCard, { type MenuItem } from './MenuItemCard';
import { Pencil } from 'lucide-react';
import Link from 'next/link';

interface MenuSectionProps {
  items: MenuItem[];
  categories?: { id: string; name: string }[];
  onAddToCart: (item: MenuItem, qty: number) => void;
  isVendorOwner: boolean;
}

export default function MenuSection({ items, categories = [], onAddToCart, isVendorOwner }: MenuSectionProps) {
  const [activeCategory, setActiveCategory] = useState<string | 'ALL'>('ALL');

  const filteredItems = activeCategory === 'ALL'
    ? items
    : items.filter((item) => item.categoryId === activeCategory);

  return (
    <section id="menu" className="relative pt-0 py-10 px-4 sm:px-6 lg:px-8">
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
            <div className="flex items-center gap-4">
              <h2 className="text-4xl font-black text-slate-100">Our Menu</h2>
              {isVendorOwner && (
                <Link
                  href="/tenant/menu"
                  className="px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-sm font-semibold hover:bg-indigo-500/20 transition-all hover:-translate-y-0.5 flex items-center gap-2"
                >
                  <Pencil size={16} aria-hidden="true" />
                  <span>Edit Menu</span>
                </Link>
              )}
            </div>
          </div>

          {/* Category pills */}
          {categories.length > 0 && (
            <div className="flex gap-2 flex-wrap" role="tablist" aria-label="Menu categories">
              <Button
                role="tab"
                id="cat-all"
                onClick={() => setActiveCategory('ALL')}
                variant={activeCategory === 'ALL' ? 'default' : 'outline'}
                size="sm"
                className={
                  activeCategory === 'ALL'
                    ? 'rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white border-transparent hover:opacity-90'
                    : 'rounded-full bg-white/5 text-slate-400 border-white/10 hover:border-amber-400/30 hover:text-amber-400 dark:bg-white/5 dark:border-white/10'
                }
              >
                All
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  role="tab"
                  id={`cat-${cat.id}`}
                  onClick={() => setActiveCategory(cat.id)}
                  variant={activeCategory === cat.id ? 'default' : 'outline'}
                  size="sm"
                  className={
                    activeCategory === cat.id
                      ? 'rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white border-transparent hover:opacity-90'
                      : 'rounded-full bg-white/5 text-slate-400 border-white/10 hover:border-amber-400/30 hover:text-amber-400 dark:bg-white/5 dark:border-white/10'
                  }
                >
                  {cat.name}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredItems.map((item) => (
            <MenuItemCard key={item.id} item={item} onAddToCart={onAddToCart} />
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="py-12 text-center text-slate-500">
            No items found in this category.
          </div>
        )}
      </div>
    </section>
  );
}
