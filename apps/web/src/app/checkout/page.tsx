'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { CustomerCheckoutDto } from '@nummygo/shared/models/dtos';
import type { FulfillmentMethod, PaymentMethod } from '@nummygo/shared/models/enums';
import { trpc } from '@/trpc/client';
import { formatPhoneNumber } from '@nummygo/shared/lib/formatters';
import { useCart } from '@/hooks/useCart';
import { GlassCard, GradientButton, FormField, BrandInput, DateTimePicker, AddressAutocomplete } from '@/components/ui';
import {
  MapPin, User, CreditCard, Store,
  ShoppingBag, X, Loader2, Clock, ChevronRight, ChevronUp,
  Utensils, FileText, Plus, Minus, Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Navbar from '@/components/Navbar';
import { useTheme } from '@/lib/themes';

/** Strip non-digit characters for form value storage */
function stripPhone(formatted: string): string {
  return formatted.replace(/\D/g, '').slice(0, 10);
}

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
  const { theme } = useTheme();
  const isLight = theme.name === 'light';

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
      <GlassCard className="relative w-full max-w-md p-6 animate-in zoom-in-95 duration-200" style={{ background: theme.bg, borderColor: theme.card.border }}>
        <button onClick={onClose} className="absolute right-4 top-4 hover:opacity-100 opacity-70 transition-opacity" style={{ color: theme.text.primary }}>
          <X className="w-5 h-5" />
        </button>
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-1" style={{ color: theme.text.primary }}>Payment Details</h3>
          <p className="text-sm" style={{ color: theme.text.muted }}>Complete your online payment securely.</p>
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

// ── Segmented Control ───────────────────────────────────────────────────────

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T; icon?: React.ReactNode }[];
  value: T;
  onChange: (val: T) => void;
}) {
  const { theme } = useTheme();
  const isLight = theme.name === 'light';

  return (
    <div className="flex rounded-xl p-1 border" style={{ borderColor: theme.card.border, background: isLight ? theme.bg : 'rgba(0,0,0,0.3)' }}>
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all duration-200"
            )}
            style={{
              background: active ? (isLight ? theme.surface : 'rgba(30,41,59,0.8)') : 'transparent',
              color: active ? theme.accent.amberHover : theme.text.muted,
              boxShadow: active && isLight ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
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

  const minDateTime = () => {
    const d = new Date(Date.now() + 15 * 60 * 1000);
    d.setSeconds(0, 0);
    const rounded = new Date(Math.ceil(d.getTime() / (5 * 60 * 1000)) * (5 * 60 * 1000));
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${rounded.getFullYear()}-${pad(rounded.getMonth() + 1)}-${pad(rounded.getDate())}T${pad(rounded.getHours())}:${pad(rounded.getMinutes())}`;
  };

  return (
    <div className="space-y-3">
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
          <DateTimePicker
            value={value}
            min={minDateTime()}
            onChange={onChange}
            placeholder="Pick a date & time"
          />
          <p className="text-xs text-slate-500 mt-1.5">Must be within vendor hours. Validated server-side.</p>
        </div>
      )}
    </div>
  );
}

// ── Step Indicator ──────────────────────────────────────────────────────────

function StepIndicator({ step, label, icon }: { step: number; label: string; icon: React.ReactNode }) {
  const { theme } = useTheme();

  return (
    <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-6">
      <div className="relative">
        <div className="absolute -inset-1 rounded-full bg-amber-500/20 blur-sm" />
        <div className="relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-amber-500/60 bg-amber-500/10 text-amber-400 font-black text-xs sm:text-sm shadow-[0_0_15px_rgba(245,158,11,0.15)]">
          {step}
        </div>
      </div>
      <h2 className="text-base sm:text-xl font-black tracking-tight flex items-center gap-2" style={{ color: theme.text.primary }}>
        {icon}
        {label}
      </h2>
    </div>
  );
}

// ── Quantity Stepper ────────────────────────────────────────────────────────

function QtyStepper({
  qty,
  onIncrease,
  onDecrease,
  onRemove,
}: {
  qty: number;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={qty <= 1 ? onRemove : onDecrease}
        className={cn(
          "flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-200",
          qty <= 1
            ? "bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20"
            : "bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-white/20"
        )}
        aria-label={qty <= 1 ? "Remove item" : "Decrease quantity"}
      >
        {qty <= 1 ? <Trash2 className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
      </button>

      <span className="flex items-center justify-center min-w-[32px] h-7 px-1 text-xs font-black text-amber-400 tabular-nums">
        {qty}
      </span>

      <button
        type="button"
        onClick={onIncrease}
        className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-all duration-200"
        aria-label="Increase quantity"
      >
        <Plus className="w-3 h-3" />
      </button>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, megaTotal, clearAll, updateItemQuantity, isLoaded } = useCart();
  const { theme } = useTheme();
  const isLight = theme.name === 'light';

  const [vendorSettings, setVendorSettings] = useState<
    Record<string, {
      fulfillmentMethod: FulfillmentMethod;
      paymentMethod: PaymentMethod;
      specialInstruction: string;
      scheduledFor: string | undefined;
    }>
  >({});
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(false);

  const placeOrderMutation = trpc.order.checkout.useMutation({
    onSuccess: (data) => {
      clearAll();
      router.push(`/track/${data.checkoutSessionId}`);
    },
    onError: (err) => {
      console.log(err);
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

  const { register, handleSubmit, control, formState: { errors } } = useForm({
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

  // ── Loading state ──
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex flex-col pt-20 items-center justify-center" style={{ background: theme.bg, color: theme.text.primary }}>
        <Loader2 className="w-8 h-8 animate-spin text-amber-500/50" />
      </div>
    );
  }

  // ── Empty cart ──
  if (cart.length === 0) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: theme.bg, color: theme.text.primary }}>
          <div className="relative mb-8">
            <div className="absolute -inset-6 rounded-full bg-amber-500/10 blur-2xl" />
            <div className="relative flex items-center justify-center w-24 h-24 rounded-full border border-amber-500/20" style={{ background: isLight ? 'rgba(245,158,11,0.05)' : 'rgba(245,158,11,0.05)' }}>
              <ShoppingBag className="w-10 h-10 text-amber-500/40" />
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-black mb-2" style={{ color: theme.text.primary }}>Your cart is empty</h2>
          <p className="text-sm mb-8 text-center max-w-xs" style={{ color: theme.text.muted }}>Looks like you haven&apos;t added any delicious items yet.</p>
          <GradientButton onClick={() => router.push('/search')} className="px-8 py-3">
            Browse Restaurants
          </GradientButton>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-20 sm:pt-24 pb-32 lg:pb-12" style={{ background: theme.bg }}>
        <div className="max-w-[1200px] w-full mx-auto px-3 sm:px-6">

          {/* ── Page Header ── */}
          <div className="mb-6 sm:mb-10">
            <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-orange-400 flex items-center gap-3">
              CHECKOUT
            </h1>
            <div className="w-12 sm:w-16 h-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 mt-2 sm:mt-3" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

            {/* ══════════════════════════════════════════════════════════════
                LEFT COLUMN — Stepper Flow
               ══════════════════════════════════════════════════════════════ */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8">
              <form id="checkout-form" onSubmit={handleSubmit(onValidSubmit)} className="space-y-6 sm:space-y-8 w-full">
                {/* ── Step 1: Your Details ── */}
                <section>
                  <StepIndicator step={1} label="YOUR DETAILS" icon={<User className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />} />

                  <div
                    className="rounded-2xl border backdrop-blur-md p-4 sm:p-6 space-y-4 shadow-sm"
                    style={{ background: isLight ? theme.bg : 'rgba(19,25,31,0.5)', borderColor: theme.card.border }}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField id="checkout-name" label="Full Name" error={errors.customerName?.message}>
                        <BrandInput
                          {...register('customerName')}
                          placeholder="Alex Rivera"
                        />
                      </FormField>
                      <FormField id="checkout-phone" label="Phone Number" error={errors.customerPhone?.message}>
                        <Controller
                          name="customerPhone"
                          control={control}
                          render={({ field }) => (
                            <BrandInput
                              value={formatPhoneNumber(field.value ?? '')}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(stripPhone(e.target.value))}
                              onBlur={field.onBlur}
                              placeholder="(437) 983-1234"
                              type="tel"
                              inputMode="numeric"
                            />
                          )}
                        />
                      </FormField>
                    </div>
                    <FormField id="checkout-email" label="Email (optional)" error={errors.customerEmail?.message}>
                      <BrandInput
                        {...register('customerEmail')}
                        type="email"
                        placeholder="alex@example.com"
                      />
                    </FormField>
                  </div>
                </section>

                {/* ── Stepper connector ── */}
                <div className="flex items-center pl-4 sm:pl-5">
                  <div className="w-px h-6 sm:h-8 bg-gradient-to-b from-amber-500/30 to-transparent" />
                </div>

                {/* ── Step 2: Order Review (editable) ── */}
                <section>
                  <StepIndicator step={2} label="ORDER REVIEW" icon={<Utensils className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />} />

                  <div className="space-y-4 sm:space-y-5">
                    {cart.map((vendor) => {
                      const vendorSubtotal = vendor.items.reduce((s, i) => s + i.price * i.quantity, 0);

                      return (
                        <div
                          key={vendor.tenantId}
                          className="rounded-2xl border backdrop-blur-md overflow-hidden shadow-sm"
                          style={{ background: isLight ? theme.bg : 'rgba(19,25,31,0.5)', borderColor: theme.card.border }}
                        >
                          {/* Vendor Header */}
                          <div className="px-4 sm:px-5 py-3 sm:py-4 border-b flex items-center justify-between" style={{ borderColor: theme.card.border }}>
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
                              <h3 className="font-bold text-sm sm:text-base" style={{ color: theme.text.primary }}>{vendor.tenantName}</h3>
                            </div>
                            <button
                              type="button"
                              onClick={() => router.push('/search')}
                              className="flex items-center gap-1 text-[10px] sm:text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-semibold uppercase tracking-wider"
                            >
                              <Plus className="w-3 h-3" />
                              <span className="hidden sm:inline">Add items</span>
                              <span className="sm:hidden">Add</span>
                            </button>
                          </div>

                          {/* Editable Item Rows */}
                          <div className="divide-y divide-white/[0.04]">
                            {vendor.items.map((item) => (
                              <div key={item.id} className="flex items-center gap-2 sm:gap-4 px-3 sm:px-5 py-3 group hover:bg-white/[0.02] transition-colors">
                                {/* Thumbnail */}
                                <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden border border-white/10 bg-slate-900 shrink-0">
                                  {item.image ? (
                                    <Image
                                      src={item.image}
                                      alt={item.name}
                                      fill
                                      className="object-cover"
                                      sizes="48px"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Utensils className="w-4 h-4 text-slate-600" />
                                    </div>
                                  )}
                                </div>

                                {/* Name + unit price */}
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs sm:text-sm font-semibold truncate" style={{ color: theme.text.primary }}>{item.name}</p>
                                  <p className="text-[10px] sm:text-xs tabular-nums" style={{ color: theme.text.muted }}>${item.price.toFixed(2)} each</p>
                                </div>

                                {/* Qty Stepper */}
                                <QtyStepper
                                  qty={item.quantity}
                                  onIncrease={() => updateItemQuantity(vendor.tenantId, item.id, item.quantity + 1)}
                                  onDecrease={() => updateItemQuantity(vendor.tenantId, item.id, item.quantity - 1)}
                                  onRemove={() => updateItemQuantity(vendor.tenantId, item.id, 0)}
                                />

                                {/* Line total */}
                                <span className="text-xs sm:text-sm font-semibold tabular-nums w-14 sm:w-16 text-right" style={{ color: theme.text.secondary }}>
                                  ${(item.price * item.quantity).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Vendor subtotal */}
                          <div className="px-4 sm:px-5 py-3 border-t border-white/5 bg-white/[0.01] flex justify-between">
                            <span className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider font-semibold">Subtotal</span>
                            <span className="text-xs sm:text-sm text-amber-300/80 font-bold tabular-nums">${vendorSubtotal.toFixed(2)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* ── Stepper connector ── */}
                <div className="flex items-center pl-4 sm:pl-5">
                  <div className="w-px h-6 sm:h-8 bg-gradient-to-b from-amber-500/30 to-transparent" />
                </div>

                {/* ── Step 3: Preferences ── */}
                <section>
                  <StepIndicator step={3} label="PREFERENCES" icon={<FileText className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />} />

                  <div className="space-y-4 sm:space-y-5">
                    {cart.map((vendor) => {
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
                        <div
                          key={vendor.tenantId}
                          className="rounded-2xl border backdrop-blur-md p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-sm"
                          style={{ background: isLight ? theme.bg : 'rgba(19,25,31,0.5)', borderColor: theme.card.border }}
                        >
                          <div className="flex items-center gap-2 sm:gap-3 pb-3 sm:pb-4 border-b" style={{ borderColor: theme.card.border }}>
                            <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
                            <h3 className="font-bold text-sm sm:text-base" style={{ color: theme.text.primary }}>{vendor.tenantName}</h3>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                            <div className="space-y-2">
                              <label className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Fulfillment
                              </label>
                              <SegmentedControl
                                value={settings.fulfillmentMethod}
                                onChange={(v) => updateSetting({ fulfillmentMethod: v })}
                                options={[
                                  { label: 'Pickup', value: 'pickup', icon: <ShoppingBag className="w-3.5 h-3.5" /> },
                                  { label: 'Delivery', value: 'delivery', icon: <MapPin className="w-3.5 h-3.5" /> }
                                ]}
                              />
                              {settings.fulfillmentMethod === 'delivery' && (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-200 mt-3 pt-3 border-t border-white/5">
                                  <label className="text-[10px] sm:text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                                    <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Delivery Address
                                  </label>
                                  <Controller
                                    name="globalDeliveryAddress"
                                    control={control}
                                    render={({ field }) => (
                                      <AddressAutocomplete
                                        id="globalDeliveryAddress"
                                        value={field.value ?? ''}
                                        onChange={(address) => field.onChange(address)}
                                        placeholder="123 Artisan Ave, Apt 4B"
                                        error={!!errors.globalDeliveryAddress?.message}
                                      />
                                    )}
                                  />
                                </div>
                              )}
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                <CreditCard className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Payment
                              </label>
                              <SegmentedControl
                                value={settings.paymentMethod}
                                onChange={(v) => updateSetting({ paymentMethod: v })}
                                options={[
                                  { label: 'At Store', value: 'counter', icon: <Store className="w-3.5 h-3.5" /> },
                                  { label: 'Online', value: 'card', icon: <CreditCard className="w-3.5 h-3.5" /> }
                                ]}
                              />
                            </div>
                          </div>

                          <div className="pt-3 border-t" style={{ borderColor: theme.card.border }}>
                            <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mb-3" style={{ color: theme.text.muted }}>
                              <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Ready Time
                            </label>
                            <ScheduleTimePicker
                              value={settings.scheduledFor}
                              onChange={(v) => updateSetting({ scheduledFor: v })}
                            />
                          </div>

                          {/* Special instructions */}
                          <div className="pt-3 border-t" style={{ borderColor: theme.card.border }}>
                            <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mb-3" style={{ color: theme.text.muted }}>
                              <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Special Instructions
                            </label>
                            <textarea
                              placeholder="Allergies, special requests..."
                              value={settings.specialInstruction}
                              onChange={(e) => updateSetting({ specialInstruction: e.target.value })}
                              rows={2}
                              className="w-full border rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm focus:outline-none focus:border-indigo-500/30 transition-colors resize-none"
                              style={{
                                background: isLight ? theme.bg : 'rgba(0,0,0,0.4)',
                                borderColor: theme.card.border,
                                color: theme.text.primary,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </form>
            </div>

            {/* ══════════════════════════════════════════════════════════════
                RIGHT COLUMN — Sticky Order Total (Desktop)
               ══════════════════════════════════════════════════════════════ */}
            <div className="hidden lg:block lg:col-span-5 lg:sticky lg:top-24" style={{ maxHeight: 'calc(100vh - 6rem)' }}>
              <div className="relative">
                {/* Ambient glow */}
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-b from-indigo-500/[0.06] to-amber-500/[0.04] blur-xl pointer-events-none" />

                <div
                  className="relative rounded-2xl border backdrop-blur-xl p-6 shadow-2xl flex flex-col"
                  style={{
                    maxHeight: 'calc(100vh - 8rem)',
                    background: isLight ? theme.surface : 'rgba(19,25,31,0.7)',
                    borderColor: theme.card.border
                  }}
                >
                  {/* Header */}
                  <div className="pb-4 border-b border-white/5 shrink-0">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Order Summary</h3>
                  </div>

                  {/* Scrollable item list */}
                  <div className="py-4 space-y-3 overflow-y-auto flex-1 min-h-0">
                    {cart.map((vendor) => (
                      <div key={vendor.tenantId}>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500/70 mb-2">
                          {vendor.tenantName}
                        </p>
                        {vendor.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-3 py-1.5">
                            <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-white/10 bg-slate-900 shrink-0">
                              {item.image ? (
                                <Image src={item.image} alt={item.name} fill className="object-cover" sizes="32px" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Utensils className="w-3 h-3 text-slate-600" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs truncate" style={{ color: theme.text.secondary }}>{item.name}</p>
                            </div>
                            <span className="text-[10px] font-black bg-amber-500/10 px-1.5 py-0.5 rounded-md border border-amber-500/20" style={{ color: isLight ? '#ea580c' : '#fbbf24' }}>
                              {item.quantity}
                            </span>
                            <span className="text-xs font-semibold tabular-nums" style={{ color: theme.text.muted }}>
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>

                  {/* Totals breakdown */}
                  <div className="pt-4 border-t space-y-2 shrink-0" style={{ borderColor: theme.card.border }}>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: theme.text.muted }}>Subtotal</span>
                      <span className="tabular-nums" style={{ color: theme.text.secondary }}>${megaTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-1" style={{ color: theme.text.muted }}>
                        Taxes & fees
                        <span className="text-[10px] border rounded px-1" style={{ borderColor: theme.card.border, color: theme.text.muted }}>by vendor</span>
                      </span>
                      <span className="text-xs" style={{ color: theme.text.muted }}>at vendor</span>
                    </div>
                  </div>

                  {/* Grand Total + CTA */}
                  <div className="pt-5 mt-3 border-t shrink-0" style={{ borderColor: theme.card.border }}>
                    <div className="flex items-end justify-between mb-5">
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: theme.text.muted }}>Grand Total</span>
                      <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-orange-400 tabular-nums">
                        ${megaTotal.toFixed(2)}
                      </span>
                    </div>

                    <GradientButton
                      type="submit"
                      form="checkout-form"
                      disabled={placeOrderMutation.isPending}
                      className="w-full py-4 text-sm font-black uppercase tracking-wider shadow-lg shadow-amber-900/20 group"
                    >
                      {placeOrderMutation.isPending ? (
                        <><Loader2 className="w-5 h-5 animate-spin inline mr-2" />Processing...</>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          CONFIRM & PAY
                          <span className="opacity-60">·</span>
                          <span className="opacity-80">${megaTotal.toFixed(2)}</span>
                          <ChevronRight className="w-4 h-4 opacity-60 group-hover:translate-x-1 transition-transform" />
                        </span>
                      )}
                    </GradientButton>

                    {needsStripe && (
                      <p className="text-center text-xs mt-3 flex items-center justify-center gap-1" style={{ color: theme.text.muted }}>
                        <CreditCard className="w-3.5 h-3.5 opacity-60" /> Secure online payment required
                      </p>
                    )}

                    <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t" style={{ borderColor: theme.card.border }}>
                      <span className="text-[10px] uppercase tracking-wider" style={{ color: theme.text.muted }}>{totalItems} items</span>
                      <span className="w-1 h-1 rounded-full bg-amber-500/50" />
                      <span className="text-[10px] uppercase tracking-wider" style={{ color: theme.text.muted }}>{cart.length} vendor{cart.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          MOBILE STICKY FOOTER — Order Summary
         ══════════════════════════════════════════════════════════════════ */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-50">
        {/* Expandable panel */}
        {mobileExpanded && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setMobileExpanded(false)}
          />
        )}

        <div
          className={cn(
            "relative z-50 border-t backdrop-blur-xl transition-all duration-300",
            mobileExpanded ? "rounded-t-2xl" : ""
          )}
          style={{ background: isLight ? theme.surface : 'rgba(10,13,20,0.95)', borderColor: theme.card.border }}
        >
          {/* Expanded content */}
          {mobileExpanded && (
            <div className="px-4 pt-4 pb-2 max-h-[50vh] overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: theme.text.muted }}>Order Summary</h3>
                <button onClick={() => setMobileExpanded(false)} className="hover:opacity-100 opacity-60" style={{ color: theme.text.primary }}>
                  <X className="w-4 h-4" />
                </button>
              </div>

              {cart.map((vendor) => (
                <div key={vendor.tenantId} className="mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500/70 mb-1.5">
                    {vendor.tenantName}
                  </p>
                  {vendor.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-2.5 py-1.5">
                      <div className="relative w-7 h-7 rounded-md overflow-hidden border border-white/10 bg-slate-900 shrink-0">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} fill className="object-cover" sizes="28px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Utensils className="w-2.5 h-2.5 text-slate-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs truncate" style={{ color: theme.text.secondary }}>{item.name}</p>
                      </div>
                      <span className="text-[10px] font-black bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20" style={{ color: isLight ? '#ea580c' : '#fbbf24' }}>
                        {item.quantity}
                      </span>
                      <span className="text-xs font-semibold tabular-nums" style={{ color: theme.text.muted }}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              ))}

              <div className="pt-3 border-t space-y-1" style={{ borderColor: theme.card.border }}>
                <div className="flex justify-between text-xs">
                  <span style={{ color: theme.text.muted }}>Subtotal</span>
                  <span className="tabular-nums" style={{ color: theme.text.secondary }}>${megaTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span style={{ color: theme.text.muted }}>Taxes & fees</span>
                  <span style={{ color: theme.text.muted }}>at vendor</span>
                </div>
              </div>
            </div>
          )}

          {/* Always-visible bottom bar */}
          <div className="px-4 py-3 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileExpanded(!mobileExpanded)}
              className="flex items-center gap-2 flex-1"
            >
              <div className="flex flex-col items-start">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{totalItems} items</span>
                <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-orange-400 tabular-nums leading-tight">
                  ${megaTotal.toFixed(2)}
                </span>
              </div>
              <ChevronUp className={cn(
                "w-4 h-4 text-slate-500 transition-transform duration-200",
                mobileExpanded ? "rotate-180" : ""
              )} />
            </button>

            <GradientButton
              type="submit"
              form="checkout-form"
              disabled={placeOrderMutation.isPending}
              className="px-6 py-3.5 text-xs font-black uppercase tracking-wider shadow-lg shadow-amber-900/20 shrink-0"
            >
              {placeOrderMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span className="flex items-center gap-1.5">
                  PLACE ORDER
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              )}
            </GradientButton>
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
