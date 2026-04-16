'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Trash2, Minus, Plus, X, Pencil, Loader2 } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useModificationMode } from '@/hooks/useModificationMode';
import { GlassCard, Button, GradientDivider, cn } from '@/components/ui';
import { trpc } from '@/trpc/client';
import { toast } from 'sonner';
import { useTheme } from '@/lib/themes';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  anchor?: 'top' | 'bottom';
}

export default function CartDrawer({ isOpen, onClose, anchor = 'top' }: CartDrawerProps) {
  const router = useRouter();
  const { cart, updateItemQuantity, removeVendorCart, megaTotal, totalItems } = useCart();
  const { mode, isActive, deactivate } = useModificationMode();
  const { theme } = useTheme();
  const isLight = theme.name === 'light';

  // Find the vendor cart that corresponds to the order being modified (if any)
  const modVendorCart = isActive && mode
    ? cart.find((v) => {
        return v.items.length > 0;
      })
    : null;

  const requestModification = trpc.order.requestModification.useMutation({
    onSuccess: () => {
      deactivate();
      onClose();
      if (mode?.sessionId) {
        router.push(`/track/${mode.sessionId}`);
      }
    },
    onError: (err) => {
      toast.error('Modification failed', { description: err.message });
    },
  });

  const handleSubmitModification = () => {
    if (!mode || !modVendorCart) return;
    requestModification.mutate({
      orderId: mode.orderId,
      items: modVendorCart.items.map((i) => ({ menuItemId: i.id, quantity: i.quantity })),
    });
  };

  return (
    <>
      {/* Responsive Backdrop - Clickaway */}
      <div
        className={cn(
          'fixed inset-0 z-[80] transition-opacity duration-300',
          'bg-black/70 backdrop-blur-sm sm:bg-transparent sm:backdrop-blur-none',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Unified Cart Container (Mobile: Bottom Sheet | Desktop: Floating Bento Popover) */}
      <div
        className={cn(
          'fixed z-[90] flex flex-col transition-all duration-500 overflow-hidden',
          // Mobile styling: Bottom sheet
          'inset-x-0 bottom-0 h-[85vh] rounded-t-[2.5rem]',
          // Desktop styling: Hovering Popover
          'sm:w-[420px] sm:h-auto sm:max-h-[85vh]',
          anchor === 'bottom' ? 'sm:bottom-24 sm:right-6 sm:top-auto sm:left-auto' : 'sm:top-20 sm:right-6 sm:bottom-auto sm:left-auto',
          'sm:rounded-[2rem] sm:border sm:border-amber-500/20 shadow-[0_0_80px_rgba(0,0,0,0.6)] sm:shadow-[0_20px_80px_rgba(245,158,11,0.15)] glow-bento',
          // Animation state scaling
          isOpen 
            ? 'translate-y-0 sm:translate-y-0 sm:scale-100 opacity-100 pointer-events-auto' 
            : 'translate-y-full sm:translate-y-0 sm:scale-95 opacity-0 pointer-events-none'
        )}
        style={{
          background: isLight ? 'rgba(255,255,255,0.96)' : 'rgba(15,20,30,0.95)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          border: `1px solid ${theme.card.border}`,
        }}
      >
        {/* Mobile Pull Indicator */}
        <div className="flex sm:hidden justify-center pt-3 pb-1 shrink-0">
          <div className="w-12 h-1.5 rounded-full bg-white/20" />
        </div>

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0 relative z-10 w-full" style={{ borderBottom: `1px solid ${theme.card.border}` }}>
          <div className="flex items-center gap-3">
            {isActive ? (
              <>
                <Pencil className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-bold text-amber-300">Editing Order</h2>
              </>
            ) : (
              <>
                <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                  <ShoppingCart className="w-4 h-4 text-amber-400" />
                </div>
                <h2 className="text-sm font-bold tracking-wide uppercase" style={{ color: theme.text.primary }}>My Cart</h2>
              </>
            )}
            {totalItems > 0 && (
              <span className={cn(
                "px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase text-white shadow-sm shadow-orange-500/30",
                isActive ? "bg-gradient-to-r from-amber-500 to-orange-400" : "bg-gradient-to-r from-amber-500 to-orange-600"
              )}>
                {totalItems} items
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isActive && (
          <div className="px-5 py-2.5 bg-amber-500/10 border-b border-amber-500/10 text-xs font-semibold text-amber-400/90 tracking-wide flex items-center gap-2">
            <span className="relative flex h-2 w-2 shadow-[0_0_8px_rgba(245,158,11,0.8)]"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span></span>
            Modification Request Active
          </div>
        )}

        {/* ── Scrollable Body ── */}
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 min-h-[320px] py-12 gap-5 px-6 text-center">
            <div className="w-24 h-24 rounded-full flex items-center justify-center border-2 border-dashed mb-2" style={{ borderColor: theme.card.border, background: theme.card.bg }}>
              <ShoppingCart className="w-8 h-8" style={{ color: theme.text.muted }} />
            </div>
            <div>
              <p className="text-base font-bold mb-1.5" style={{ color: theme.text.primary }}>Your cart is empty</p>
              <p className="text-sm text-center max-w-[220px] leading-relaxed" style={{ color: theme.text.muted }}>Looks like you haven't added any delicious items yet.</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto w-full custom-minimal-scrollbar px-4 py-4 space-y-4">
            {cart.map((vendor, idx) => {
              return (
                <div key={vendor.tenantId} className="w-full">
                  {/* Minimized Vendor Header */}
                  <div className="flex items-center justify-between mb-2 px-1">
                    <h3 className="font-bold text-xs text-amber-400 uppercase tracking-widest">{vendor.tenantName}</h3>
                    {!isActive && (
                      <button
                        onClick={() => removeVendorCart(vendor.tenantId)}
                        className="text-[10px] uppercase font-bold tracking-widest text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Aesthetic List Items */}
                  <div className="space-y-2 mb-2">
                    {vendor.items.map((item) => (
                      <div key={item.id} className="group flex items-center gap-3 p-2.5 rounded-xl transition-colors relative overflow-hidden" style={{ background: theme.card.bg, border: `1px solid ${theme.card.border}` }}>
                        
                        {/* Thumbnail */}
                        <div className="w-12 h-12 rounded-lg bg-black/50 overflow-hidden shrink-0 border border-white/5 relative flex items-center justify-center shadow-lg">
                          {item.image ? (
                            <Image src={item.image} alt={item.name} fill sizes="48px" className="object-cover" />
                          ) : (
                            <ShoppingCart className="w-4 h-4 text-white/20" />
                          )}
                        </div>

                        {/* Title/Price */}
                        <div className="flex-1 min-w-0 pr-1">
                          <h4 className="text-sm font-bold truncate leading-tight" style={{ color: theme.text.primary }}>{item.name}</h4>
                          <p className="text-xs mt-0.5 truncate" style={{ color: theme.text.secondary }}>${item.price.toFixed(2)}</p>
                        </div>

                        {/* Quantity Stepper */}
                        <div className="flex items-center gap-2 rounded-full bg-black/40 border border-white/5 p-1 backdrop-blur-sm self-start shadow-inner">
                          <button
                            onClick={() => updateItemQuantity(vendor.tenantId, item.id, item.quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                          >
                            <Minus size={12} strokeWidth={3} />
                          </button>
                          <span className="w-4 text-center text-xs font-black text-white tabular-nums select-none pt-[1px]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateItemQuantity(vendor.tenantId, item.id, item.quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                          >
                            <Plus size={12} strokeWidth={3} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {idx < cart.length - 1 && <div className="h-px bg-white/[0.05] mt-4 mb-2 mx-2" />}
                </div>
              );
            })}
            <div className="h-4" aria-hidden="true" />
          </div>
        )}

        {/* ── Footer ── */}
        {cart.length > 0 && (
          <div className="w-full px-5 py-5 shrink-0 relative z-10" style={{ borderTop: `1px solid ${theme.card.border}`, background: isLight ? 'rgba(255,255,255,0.95)' : 'rgba(10,13,20,0.8)', backdropFilter: 'blur(20px)' }}>
            
            {/* Minimal Summary */}
            <div className="flex items-center justify-between mb-4 px-2">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Grand Total</span>
              <span className="text-xl font-black text-amber-400">${megaTotal.toFixed(2)}</span>
            </div>

            {isActive ? (
              <Button
                variant="gradient"
                onClick={handleSubmitModification}
                disabled={requestModification.isPending}
                className="w-full h-12 rounded-full text-sm font-black uppercase tracking-widest text-black"
              >
                {requestModification.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Request Update'}
              </Button>
            ) : (
              <Button
                variant="gradient"
                className="w-full h-12 rounded-full text-sm font-black uppercase tracking-widest text-black"
                onClick={() => {
                  onClose();
                  window.location.href = '/checkout';
                }}
              >
                Go to Checkout <span className="opacity-70 ml-1">→</span>
              </Button>
            )}
          </div>
        )}
      </div>

      <style jsx global>{`
        .custom-minimal-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-minimal-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-minimal-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 4px;
        }
        .custom-minimal-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.2);
        }
        .glow-bento {
          box-shadow: inset 0 1px 0 0 rgba(255,255,255,0.05), inset 0 0 0 1px rgba(255,255,255,0.02), 0 20px 80px rgba(245,158,11,0.15);
        }
      `}</style>
    </>
  );
}
