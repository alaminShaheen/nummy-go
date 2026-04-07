'use client';

import React from 'react';
import Image from 'next/image';
import { ShoppingCart, Trash2, Minus, Plus, X } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { GlassCard, GradientButton, GradientDivider, cn } from '@/components/ui';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cart, updateItemQuantity, removeVendorCart, megaTotal, totalItems } = useCart();

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full w-full sm:w-[420px] z-50 flex flex-col transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        style={{ background: 'var(--color-brand-bg)' }}
      >
        {/* ── Header ── */}
        <div
          className="flex items-center justify-between px-6 py-5 shrink-0 border-b border-white/5"
          style={{ background: 'var(--color-brand-surface)' }}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl" aria-hidden="true">🛒</span>
            <h2 className="text-lg font-bold text-slate-100">Your Cart</h2>
            {totalItems > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gradient-to-r from-amber-500 to-orange-600 text-white">
                {totalItems}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full border border-white/10 hover:border-amber-400/30 hover:text-amber-400 text-slate-500 transition-all duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Body ── */}
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-4 px-6">
            <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'var(--color-brand-card)' }}>
              <ShoppingCart className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-slate-500 text-sm font-medium">Your cart is empty</p>
            <p className="text-slate-600 text-xs text-center">Browse vendors and add items to get started</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
            {cart.map((vendor, idx) => {
              const vendorSubtotal = vendor.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

              return (
                <React.Fragment key={vendor.tenantId}>
                  {/* ── Vendor Group ── */}
                  <GlassCard className="overflow-hidden" style={{ background: 'var(--color-brand-card)' }}>
                    {/* Vendor Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="text-base" aria-hidden="true">🍽️</span>
                        <h3 className="font-semibold text-sm text-amber-400">{vendor.tenantName}</h3>
                      </div>
                      <button
                        onClick={() => removeVendorCart(vendor.tenantId)}
                        title={`Remove all items from ${vendor.tenantName}`}
                        className="p-1.5 rounded-full text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Items */}
                    <div className="divide-y divide-white/5">
                      {vendor.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                          {/* Item image */}
                          {item.image && (
                            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-white/5">
                              <Image
                                src={item.image}
                                alt={item.name}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}

                          {/* Name + price */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-slate-200 text-sm font-medium truncate">{item.name}</h4>
                            <p className="text-amber-400/80 text-xs mt-0.5 font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                          </div>

                          {/* Quantity stepper */}
                          <div className="flex items-center gap-1 rounded-full border border-white/10 p-0.5" style={{ background: 'var(--color-brand-surface)' }}>
                            <button
                              onClick={() => updateItemQuantity(vendor.tenantId, item.id, item.quantity - 1)}
                              className="w-6 h-6 flex items-center justify-center rounded-full text-slate-500 hover:text-slate-200 hover:bg-white/10 transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-5 text-center text-xs font-semibold text-slate-200 tabular-nums select-none">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateItemQuantity(vendor.tenantId, item.id, item.quantity + 1)}
                              className="w-6 h-6 flex items-center justify-center rounded-full text-slate-500 hover:text-slate-200 hover:bg-white/10 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Vendor Subtotal */}
                    <div className="flex items-center justify-between px-4 py-3 border-t border-white/5" style={{ background: 'rgba(19,25,31,0.5)' }}>
                      <span className="text-xs text-slate-500 font-medium">Subtotal</span>
                      <span className="text-sm font-bold text-slate-200">${vendorSubtotal.toFixed(2)}</span>
                    </div>
                  </GlassCard>

                  {idx < cart.length - 1 && <GradientDivider accent="indigo" />}
                </React.Fragment>
              );
            })}
            {/* Spacer for footer */}
            <div className="h-36" aria-hidden="true" />
          </div>
        )}

        {/* ── Footer ── */}
        {cart.length > 0 && (
          <div
            className="absolute bottom-0 left-0 right-0 px-5 pb-6 pt-8 shrink-0 z-10"
            style={{
              background: 'linear-gradient(to top, var(--color-brand-bg) 60%, transparent)',
            }}
          >
            {/* Total line */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-sm font-medium">Total</span>
              <span className="text-xl font-black gradient-text">${megaTotal.toFixed(2)}</span>
            </div>

            {/* Checkout CTA */}
            <GradientButton className="w-full py-3.5 text-sm rounded-full shadow-lg shadow-orange-900/40">
              <ShoppingCart className="w-4 h-4" />
              Proceed to Checkout
            </GradientButton>
          </div>
        )}
      </div>
    </>
  );
}
