'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { customerCheckoutSchema } from '@nummygo/shared/models/dtos';
import type { CustomerCheckoutDto } from '@nummygo/shared/models/dtos';
import type { FulfillmentMethod, PaymentMethod } from '@nummygo/shared/models/enums';
import { trpc } from '@/trpc/client';
import { useCart } from '@/hooks/useCart';
import { GlassCard, GradientButton, FormField, BrandInput, SectionLabel } from '@/components/ui';
import { MapPin, User, Mail, Phone, CreditCard, Store, ShoppingBag, X, Loader2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import Navbar from '@/components/Navbar';

// ── Stripe Modal UI (Mock) ──────────────────────────────────────────────────

function StripePaymentModal({
  isOpen,
  amount,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  amount: number;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onSuccess();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <GlassCard className="relative w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute right-4 top-4 text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
        <div className="mb-6">
          <h3 className="text-xl font-bold text-white mb-1">Payment Details</h3>
          <p className="text-sm text-slate-400">Complete your online payment securely.</p>
        </div>
        <div className="space-y-4">
          <FormField id="card-info" label="Card Information">
            <div className="border border-white/10 rounded-lg overflow-hidden bg-black/40">
              <input
                type="text"
                placeholder="Card number"
                className="w-full bg-transparent px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none border-b border-white/10"
              />
              <div className="flex">
                <input
                  type="text"
                  placeholder="MM / YY"
                  className="w-1/2 bg-transparent px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none border-r border-white/10"
                />
                <input
                  type="text"
                  placeholder="CVC"
                  className="w-1/2 bg-transparent px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none"
                />
              </div>
            </div>
          </FormField>
          <GradientButton
            className="w-full py-3.5 mt-2 shadow-lg shadow-indigo-500/20"
            onClick={handlePay}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              `Pay $${amount.toFixed(2)}`
            )}
          </GradientButton>
        </div>
      </GlassCard>
    </div>
  );
}

// ── Segmented Control primitive ─────────────────────────────────────────────

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T; icon?: React.ReactNode }[];
  value: T;
  onChange: (val: T) => void;
}) {
  return (
    <div className="flex rounded-lg p-1 border border-white/10 bg-black/30">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-md transition-all duration-200",
              active
                ? "bg-slate-800 text-amber-400 shadow-sm border border-white/5"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            {opt.icon}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Schedule Time Picker ────────────────────────────────────────────────────

function ScheduleTimePicker({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (val: string | undefined) => void;
}) {
  const [isScheduled, setIsScheduled] = useState(!!value);

  const handleToggle = (scheduled: boolean) => {
    setIsScheduled(scheduled);
    if (!scheduled) onChange(undefined);
  };

  // Build min datetime: now + 15 minutes, rounded to nearest 5
  const minDateTime = () => {
    const d = new Date(Date.now() + 15 * 60 * 1000);
    d.setSeconds(0, 0);
    const rounded = new Date(Math.ceil(d.getTime() / (5 * 60 * 1000)) * (5 * 60 * 1000));
    // Format as local datetime string (YYYY-MM-DDTHH:MM)
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${rounded.getFullYear()}-${pad(rounded.getMonth() + 1)}-${pad(rounded.getDate())}T${pad(rounded.getHours())}:${pad(rounded.getMinutes())}`;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Clock className="w-4 h-4 text-indigo-400" />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pickup / Ready Time</span>
      </div>
      <SegmentedControl
        value={isScheduled ? 'scheduled' : 'asap'}
        onChange={(v) => handleToggle(v === 'scheduled')}
        options={[
          { label: 'ASAP', value: 'asap' },
          { label: 'Schedule', value: 'scheduled', icon: <Clock className="w-3.5 h-3.5" /> },
        ]}
      />
      {isScheduled && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
          <input
            type="datetime-local"
            min={minDateTime()}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value || undefined)}
            className="w-full bg-black/40 border border-indigo-500/20 rounded-md px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 transition-all"
          />
          <p className="text-xs text-slate-500 mt-1.5">Must be within the vendor's business hours. Validated server-side.</p>
        </div>
      )}
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, megaTotal, clearAll, isLoaded } = useCart();

  const [vendorSettings, setVendorSettings] = useState<
    Record<string, {
      fulfillmentMethod: FulfillmentMethod;
      paymentMethod: PaymentMethod;
      specialInstruction: string;
      scheduledFor: string | undefined;
    }>
  >({});
  const [showStripeModal, setShowStripeModal] = useState(false);

  const placeOrderMutation = trpc.order.checkout.useMutation({
    onSuccess: (data) => {
      clearAll();
      router.push(`/track/${data.checkoutSessionId}`);
    },
    onError: (err) => {
      alert(`Error placing order: ${err.message}`);
    }
  });

  useEffect(() => {
    if (cart.length > 0 && Object.keys(vendorSettings).length === 0) {
      const initial: typeof vendorSettings = {};
      cart.forEach((v) => {
        initial[v.tenantId] = {
          fulfillmentMethod: 'pickup',
          paymentMethod: 'counter',
          specialInstruction: '',
          scheduledFor: undefined,
        };
      });
      setVendorSettings(initial);
    }
  }, [cart, vendorSettings]);

  const checkoutFormSchema = z.object({
    customerName: z.string().trim().min(1, 'Name is required'),
    customerPhone: z.string().length(10, 'Valid phone required'),
    customerEmail: z.string().email('Invalid email').optional().or(z.literal('')),
    globalDeliveryAddress: z.string().trim().optional(),
  });

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(checkoutFormSchema),
  });

  const needsDelivery = Object.values(vendorSettings).some(v => v.fulfillmentMethod === 'delivery');
  const needsStripe = Object.values(vendorSettings).some(v => v.paymentMethod === 'card');
  const totalItems = cart.reduce((acc, v) => acc + v.items.reduce((sum, item) => sum + item.quantity, 0), 0);
  const [pendingFormData, setPendingFormData] = useState<any>(null);

  const onValidSubmit = (data: any) => {
    const finalCart = cart.flatMap(v => {
      const settings = vendorSettings[v.tenantId];
      if (!settings) return [];
      return [{
        tenantId: v.tenantId,
        items: v.items.map(i => ({ menuItemId: i.id, quantity: i.quantity })),
        specialInstruction: settings.specialInstruction || undefined,
        paymentMethod: settings.paymentMethod,
        fulfillmentMethod: settings.fulfillmentMethod,
        scheduledFor: settings.scheduledFor,
      }];
    });

    const payload: CustomerCheckoutDto = {
      ...data,
      globalDeliveryAddress: needsDelivery ? data.globalDeliveryAddress : undefined,
      cart: finalCart,
    };

    if (needsDelivery && !payload.globalDeliveryAddress) {
      alert("A delivery address is required for delivery orders.");
      return;
    }

    if (needsStripe) {
      setPendingFormData(payload);
      setShowStripeModal(true);
    } else {
      placeOrderMutation.mutate(payload);
    }
  };

  const handleStripeSuccess = () => {
    setShowStripeModal(false);
    if (pendingFormData) {
      placeOrderMutation.mutate(pendingFormData);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col pt-20 items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500/50" />
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col pt-20 items-center justify-center text-white">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <GradientButton onClick={() => router.push('/search')}>Browse Restaurants</GradientButton>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-24 pb-12" style={{ background: 'var(--color-brand-bg)' }}>
        <div className="max-w-[1100px] w-full mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* ── Left Column: Checkout Details ── */}
            <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-6">
              <div className="mb-2">
                <h1 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-indigo-100 to-amber-200">
                  CHECKOUT DETAILS
                </h1>
                <p className="text-slate-400 text-sm mt-1">Complete your order securely.</p>
              </div>

              <form id="checkout-form" onSubmit={handleSubmit(onValidSubmit)} className="space-y-6">
                <GlassCard className="p-6 border border-indigo-500/10">
                  <div className="flex items-center gap-2 text-indigo-400 mb-4">
                    <User className="w-5 h-5" />
                    <h3 className="font-bold uppercase tracking-wider text-sm">Customer Contact</h3>
                  </div>
                  <div className="space-y-4 mt-5">
                    <FormField id="checkout-name" label="Full Name" error={errors.customerName?.message}>
                      <BrandInput {...register('customerName')} placeholder="Alex Rivera" />
                    </FormField>
                    <FormField id="checkout-email" label="Email Address" error={errors.customerEmail?.message}>
                      <BrandInput {...register('customerEmail')} type="email" placeholder="alex@example.com" />
                    </FormField>
                    <FormField id="checkout-phone" label="Phone Number" error={errors.customerPhone?.message}>
                      <BrandInput {...register('customerPhone')} placeholder="10-digit number" />
                    </FormField>
                  </div>
                </GlassCard>

                <GlassCard className={cn(
                  "p-6 border transition-colors",
                  needsDelivery ? "border-amber-500/30 bg-amber-950/10" : "border-white/5 opacity-80"
                )}>
                  <div className={cn("flex items-center gap-2 mb-4", needsDelivery ? "text-amber-400" : "text-slate-500")}>
                    <MapPin className="w-5 h-5" />
                    <h3 className="font-bold uppercase tracking-wider text-sm">Global Delivery Address</h3>
                  </div>
                  {needsDelivery && (
                    <p className="text-xs text-amber-500/80 mt-1 mb-3">Required for delivery orders.</p>
                  )}
                  <div className="mt-4">
                    <BrandInput
                      {...register('globalDeliveryAddress')}
                      placeholder="e.g. 123 Artisan Ave, Apt 4B, New York, NY"
                    />
                  </div>
                </GlassCard>
              </form>
            </div>

            {/* ── Right Column: Order Summary ── */}
            <div className="lg:col-span-7 space-y-6">
              <div className="mb-2">
                <h2 className="text-2xl font-bold text-white">ORDER SUMMARY</h2>
                <div className="flex items-center text-slate-400 text-sm mt-1">
                  <Store className="w-4 h-4 mr-1.5" />
                  {cart.length} Partner{cart.length !== 1 && 's'} • {totalItems} Items
                </div>
              </div>

              <div className="space-y-6">
                {cart.map((vendor) => {
                  const vendorSubtotal = vendor.items.reduce((s, i) => s + i.price * i.quantity, 0);
                  const settings = vendorSettings[vendor.tenantId];
                  if (!settings) return null;

                  const updateSetting = (patch: Partial<typeof settings>) => {
                    setVendorSettings(prev => {
                      const existing = prev[vendor.tenantId];
                      if (!existing) return prev;
                      return { ...prev, [vendor.tenantId]: { ...existing, ...patch } };
                    });
                  };

                  return (
                    <div key={vendor.tenantId} className="rounded-2xl border border-white/5 overflow-hidden" style={{ background: 'var(--color-brand-card)' }}>
                      {/* Partner Header */}
                      <div className="px-5 py-4 border-b border-white/5 bg-white/[0.02]">
                        <h3 className="font-bold text-slate-100 text-lg flex items-center">
                          {vendor.tenantName}
                        </h3>
                      </div>

                      {/* Compact Item List */}
                      <div className="px-5 py-4 space-y-3">
                        {vendor.items.map((item) => (
                          <div key={item.id} className="flex items-start justify-between text-sm">
                            <div className="flex gap-3">
                              <span className="text-slate-500 min-w-[20px] font-medium">{item.quantity}x</span>
                              <span className="text-slate-200">{item.name}</span>
                            </div>
                            <span className="text-slate-300 ml-4">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Settings Block */}
                      <div className="px-5 pb-5 pt-3 border-t border-white/5 bg-black/20">
                        <div className="text-xs font-medium text-slate-500 mb-3 uppercase tracking-wider">Order Preferences</div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <span className="text-xs text-slate-400">Method</span>
                            <SegmentedControl
                              value={settings.fulfillmentMethod}
                              onChange={(v) => updateSetting({ fulfillmentMethod: v })}
                              options={[
                                { label: 'Pickup', value: 'pickup', icon: <ShoppingBag className="w-3.5 h-3.5" /> },
                                { label: 'Delivery', value: 'delivery', icon: <MapPin className="w-3.5 h-3.5" /> }
                              ]}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <span className="text-xs text-slate-400">Payment</span>
                            <SegmentedControl
                              value={settings.paymentMethod}
                              onChange={(v) => updateSetting({ paymentMethod: v })}
                              options={[
                                { label: 'Pay at Store', value: 'counter', icon: <Store className="w-3.5 h-3.5" /> },
                                { label: 'Pay Online', value: 'card', icon: <CreditCard className="w-3.5 h-3.5" /> }
                              ]}
                            />
                          </div>
                        </div>

                        {/* Scheduling widget */}
                        <div className="mt-4 pt-4 border-t border-white/5">
                          <ScheduleTimePicker
                            value={settings.scheduledFor}
                            onChange={(v) => updateSetting({ scheduledFor: v })}
                          />
                        </div>

                        <div className="mt-4">
                          <input
                            type="text"
                            placeholder="Notes for vendor (e.g. Allergies, special requests)"
                            value={settings.specialInstruction}
                            onChange={(e) => updateSetting({ specialInstruction: e.target.value })}
                            className="w-full bg-black/40 border border-white/5 rounded-md px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/30 transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Mega Total & Submit */}
              <GlassCard className="p-6 sticky bottom-6 z-20 border border-amber-500/20 shadow-2xl shadow-indigo-900/20">
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <span className="block text-slate-400 text-sm mb-1 uppercase tracking-wider font-semibold">Grand Total</span>
                    <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-orange-400">
                      ${megaTotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Taxes & fees calculated<br />by vendor</p>
                  </div>
                </div>

                <GradientButton
                  type="submit"
                  form="checkout-form"
                  disabled={placeOrderMutation.isPending}
                  className="w-full py-4 text-base font-bold shadow-lg shadow-amber-900/20 group"
                >
                  {placeOrderMutation.isPending ? (
                    <><Loader2 className="w-5 h-5 animate-spin inline mr-2" />Processing...</>
                  ) : (
                    <>PLACE ORDER <span className="opacity-70 font-normal ml-1">${megaTotal.toFixed(2)}</span></>
                  )}
                </GradientButton>
                {needsStripe && (
                  <p className="text-center text-xs text-slate-500 mt-3 flex items-center justify-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 opacity-60" /> Secure online payment required for some items
                  </p>
                )}
              </GlassCard>
            </div>

          </div>
        </div>
      </div>

      <StripePaymentModal
        isOpen={showStripeModal}
        amount={megaTotal}
        onClose={() => setShowStripeModal(false)}
        onSuccess={handleStripeSuccess}
      />
    </>
  );
}
