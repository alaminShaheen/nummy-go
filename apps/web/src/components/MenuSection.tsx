'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';
import { SectionLabel } from '@/components/ui';
import MenuItemCard, { type MenuItem } from './MenuItemCard';
import { CookingPot } from 'lucide-react';
import { useTheme } from '@/lib/themes';

interface MenuSectionProps {
  items: MenuItem[];
  categories?: { id: string; name: string }[];
  onAddToCart?: (item: MenuItem, qty: number) => void;
  onUpdateQuantity?: (item: MenuItem, qty: number) => void;
  cartQuantities?: Record<string, number>;
  isClosed?: boolean;
}

export default function MenuSection({ items, categories = [], onAddToCart, onUpdateQuantity, cartQuantities = {}, isClosed = false }: MenuSectionProps) {
  const [activeCategory, setActiveCategory] = useState<string | 'ALL'>('ALL');
  const { theme } = useTheme();

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
              <h2 className="text-4xl font-black" style={{ color: theme.text.primary }}>Our Menu</h2>
            </div>
          </div>
        </div>

        {/* Category Sticky Navigation Rail */}
        {categories.length > 0 && (
          <div
            className="sticky top-[64px] z-[40] -mx-4 px-4 sm:mx-0 sm:px-0 py-4 mb-6 backdrop-blur-md border-b shadow-lg"
            style={{
              background: `${theme.bg}cc`,
              borderColor: theme.card.border,
            }}
          >
            <div className="flex gap-2 overflow-x-auto no-scrollbar whitespace-nowrap" role="tablist" aria-label="Menu categories">
              <Button
                role="tab"
                id="cat-all"
                onClick={() => setActiveCategory('ALL')}
                variant={activeCategory === 'ALL' ? 'default' : 'outline'}
                size="sm"
                className={
                  activeCategory === 'ALL'
                    ? 'rounded-full px-5 bg-gradient-to-r from-amber-500 to-orange-600 text-white border-transparent hover:opacity-90 shadow-lg shadow-amber-500/20'
                    : 'rounded-full px-5 border-transparent hover:border-amber-400/30 hover:text-amber-400'
                }
                style={activeCategory !== 'ALL' ? { color: theme.text.secondary, background: theme.card.bg, border: `1px solid ${theme.card.border}` } : {}}
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
                      ? 'rounded-full px-5 bg-gradient-to-r from-amber-500 to-orange-600 text-white border-transparent hover:opacity-90 shadow-lg shadow-amber-500/20'
                      : 'rounded-full px-5 border-transparent hover:border-amber-400/30 hover:text-amber-400'
                  }
                  style={activeCategory !== cat.id ? { color: theme.text.secondary, background: theme.card.bg, border: `1px solid ${theme.card.border}` } : {}}
                >
                  {cat.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredItems.map((item) => {
            const categoryName = categories.find((c) => c.id === item.categoryId)?.name;
            return <MenuItemCard 
              key={item.id} 
              item={item} 
              onAddToCart={onAddToCart} 
              onUpdateQuantity={onUpdateQuantity}
              cartQty={cartQuantities[item.id] || 0}
              categoryName={categoryName} 
              isClosed={isClosed}
            />;
          })}
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="py-24 px-4 flex flex-col items-center justify-center text-center animate-slide-up">
            <div className="relative mb-8 animate-float">
              {/* Subtle stove-fire glow behind the pot */}
              <div className="absolute inset-0 bg-amber-500/10 blur-xl rounded-full" />
              <div className="relative w-24 h-24 rounded-full flex items-center justify-center shadow-2xl mb-4" style={{ background: theme.surface, border: `1px solid ${theme.card.border}` }}>
                <CookingPot className="w-10 h-10 text-amber-500 opacity-80" />
                <div className="absolute -top-2 left-1/2 -translate-x-4 w-1.5 h-1.5 rounded-full animate-ping" style={{ background: theme.text.muted, animationDuration: '2s' }} />
                <div className="absolute -top-4 left-1/2 translate-x-2 w-1.5 h-1.5 rounded-full animate-ping" style={{ background: theme.text.muted, animationDuration: '2.5s', animationDelay: '0.5s' }} />
              </div>
            </div>
            
            <h3 className="text-2xl font-black mb-3 tracking-tight" style={{ color: theme.text.primary }}>
              {activeCategory === 'ALL' ? "The ovens are warming up!" : "Fresh out of these right now!"}
            </h3>
            
            <p className="text-base max-w-sm mx-auto leading-relaxed" style={{ color: theme.text.secondary }}>
              {activeCategory === 'ALL'
                ? "Our kitchen is still putting the final touches on our online menu. We'll be serving up something delicious here very soon."
                : "Looks like we don't have any items in this specific category today. Why not take a peek at what else is cooking?"}
            </p>
            
            {activeCategory !== 'ALL' && (
              <Button
                variant="outline"
                onClick={() => setActiveCategory('ALL')}
                className="mt-8 rounded-full px-8 py-6 text-sm font-bold border-amber-500/20 bg-amber-500/5 text-amber-400 hover:text-amber-300 hover:border-amber-400/40 hover:bg-amber-400/10 transition-all shadow-[0_0_20px_rgba(245,158,11,0.05)] backdrop-blur-md"
              >
                See Full Menu
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
