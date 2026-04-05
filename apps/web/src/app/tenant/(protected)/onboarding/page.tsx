'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/trpc/client';
import Navbar from '@/components/Navbar';
import StorefrontPreview from '@/components/StorefrontPreview';
import { FormField, BrandInput, Button } from '@nummygo/shared/ui';
import {
  DAYS,
  DAY_LABELS,
  makeDefaultTenantForm,
  type TenantFormValues,
  type DayHours,
  type Day,
} from '@/constants/tenant';
import { toSlug } from '@/utils/tenant';
import {
  Building2, Phone, Clock,
  CheckCircle2, ChevronRight,
  AlertCircle, Loader2,
} from 'lucide-react';

// ─── Onboarding Page ──────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter();
  const { data: tenant, isLoading } = trpc.tenant.me.useQuery();
  const onboard = trpc.tenant.onboard.useMutation({
    onSuccess: (data) => router.push(`/${data?.slug}`),
  });

  const [form, setForm] = useState<TenantFormValues>(makeDefaultTenantForm);
  const [slugManual, setSlugManual] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof TenantFormValues, string>>>({});

  const checkSlug = trpc.tenant.checkSlug.useQuery(
    { slug: form.slug },
    { enabled: form.slug.length >= 2, refetchOnWindowFocus: false },
  );

  // Redirect if already onboarded
  useEffect(() => {
    if (tenant?.onboardingCompleted) router.push(`/${tenant.slug}`);
  }, [tenant, router]);

  // Sync slug availability from query
  useEffect(() => {
    if (checkSlug.data !== undefined) setSlugAvailable(checkSlug.data.available);
  }, [checkSlug.data]);

  // Controlled field setter — auto-generates slug from name until user edits slug manually
  const setField = useCallback(<K extends keyof TenantFormValues>(key: K, value: TenantFormValues[K]) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'name' && !slugManual) next.slug = toSlug(value as string);
      return next;
    });
    setErrors((e) => ({ ...e, [key]: undefined }));
  }, [slugManual]);

  const setDayHours = (day: Day, field: keyof DayHours, value: string | boolean) => {
    setForm((prev) => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: { ...prev.businessHours[day], [field]: value },
      },
    }));
  };

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = 'Restaurant name is required';
    if (!form.slug || form.slug.length < 2) e.slug = 'Slug must be at least 2 characters';
    if (!/^[a-z0-9-]+$/.test(form.slug)) e.slug = 'Only lowercase letters, numbers and hyphens';
    if (!form.phoneNumber || form.phoneNumber.length < 7) e.phoneNumber = 'Valid phone number required';
    if (!form.address.trim()) e.address = 'Business address is required';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email address';
    if (slugAvailable === false) e.slug = 'This slug is already taken';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onboard.mutateAsync({
      name: form.name,
      slug: form.slug,
      phoneNumber: form.phoneNumber,
      email: form.email || undefined,
      address: form.address || undefined,
      businessHours: form.businessHours,
    });
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0D1117' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-amber-400/30 border-t-amber-400 animate-spin" />
          <p className="text-slate-500 text-sm">Loading your profile…</p>
        </div>
      </div>
    );
  }

  if (tenant?.onboardingCompleted) return null;

  // ── Slug availability indicator (passed to BrandInput suffix) ─────────────
  const slugSuffix = form.slug.length >= 2
    ? checkSlug.isFetching
      ? <Loader2 size={13} className="text-slate-500 animate-spin" />
      : slugAvailable === true
        ? <CheckCircle2 size={13} className="text-green-400" />
        : slugAvailable === false
          ? <AlertCircle size={13} className="text-rose-400" />
          : null
    : null;

  return (
    <>
      <Navbar />

      <div className="min-h-screen pt-20 pb-16 px-4 sm:px-6 lg:px-8" style={{ background: '#0D1117' }}>
        {/* Ambient glows — matches global brand palette */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div style={{
            position: 'absolute', top: '-10%', left: '-5%',
            width: 600, height: 600, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(251,191,36,0.10) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }} />
          <div style={{
            position: 'absolute', bottom: '5%', right: '-5%',
            width: 500, height: 500, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">

          {/* Page header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" aria-hidden="true" />
              Step 1 of 1 · Set up your storefront
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-100">
              Welcome to <span className="gradient-text">nummyGo</span> 🔥
            </h1>
            <p className="text-slate-400 mt-3 max-w-md mx-auto text-sm leading-relaxed">
              Tell us about your restaurant. This information will appear on your public
              storefront — you can edit it any time from your profile.
            </p>
          </div>

          {/* Two-column layout: form + live preview */}
          <div className="grid md:grid-cols-[1fr_380px] lg:grid-cols-[1fr_420px] gap-6 items-start">

            {/* ════ FORM ════ */}
            <form
              onSubmit={handleSubmit}
              noValidate
              className="flex flex-col gap-5"
              aria-label="Restaurant onboarding form"
            >
              {/* ── Card: Basic Info ── */}
              <FormCard icon={<Building2 size={15} />} title="Basic Info">
                <FormField id="name" label="Restaurant Name" required error={errors.name}>
                  <BrandInput
                    id="name"
                    value={form.name}
                    onValueChange={(v: string) => setField('name', v)}
                    placeholder="The Golden Fork"
                    autoFocus
                  />
                </FormField>

                <FormField
                  id="slug"
                  label="Your nummyGo URL"
                  required
                  error={errors.slug}
                  hint={!errors.slug ? 'Lowercase letters, numbers and hyphens only.' : undefined}
                >
                  <BrandInput
                    id="slug"
                    value={form.slug}
                    onValueChange={(v: string) => {
                      setSlugManual(true);
                      setSlugAvailable(null);
                      setField('slug', toSlug(v));
                    }}
                    placeholder="the-golden-fork"
                    prefix="nummygo.com/"
                    suffix={slugSuffix}
                  />
                  {
                    form.slug.length >= 2 && slugAvailable !== null &&
                    <>
                      {slugAvailable === true ? (
                        <p className="text-xs text-green-400 flex items-center gap-1 mt-0.5">
                          <CheckCircle2 size={11} aria-hidden="true" /> Available!
                        </p>
                      ) : <p className="text-xs text-rose-400 flex items-center gap-1 mt-0.5">
                        <AlertCircle size={13} className="text-rose-400" /> Not Available!
                      </p>}
                    </>
                  }
                </FormField>
              </FormCard>

              {/* ── Card: Contact ── */}
              <FormCard icon={<Phone size={15} />} title="Contact">
                <FormField
                  id="phoneNumber"
                  label="Phone Number"
                  required
                  error={errors.phoneNumber}
                  hint="Customers will use this to call you."
                >
                  <BrandInput
                    id="phoneNumber"
                    type="tel"
                    value={form.phoneNumber}
                    onValueChange={(v: string) => setField('phoneNumber', v)}
                    placeholder="+1 (416) 555-0100"
                  />
                </FormField>

                <FormField
                  id="email"
                  label="Email Address"
                  error={errors.email}
                  hint="Optional — shown on your storefront for customer enquiries."
                >
                  <BrandInput
                    id="email"
                    type="email"
                    value={form.email}
                    onValueChange={(v: string) => setField('email', v)}
                    placeholder="hello@yourrestaurant.com"
                  />
                </FormField>

                <FormField
                  id="address"
                  label="Business Address"
                  required
                  error={errors.address}
                  hint="Where customers can find you. This will open Google Maps when clicked."
                >
                  <BrandInput
                    id="address"
                    value={form.address}
                    onValueChange={(v: string) => setField('address', v)}
                    placeholder="123 Main St, New York, NY 10001"
                  />
                </FormField>
              </FormCard>

              {/* ── Card: Business Hours ── */}
              <FormCard icon={<Clock size={15} />} title="Business Hours">
                <div className="flex flex-col gap-2">
                  {DAYS.map((day) => {
                    const dh = form.businessHours[day];
                    return (
                      <div
                        key={day}
                        className={`
                          flex items-center gap-3 rounded-xl px-3 py-2.5 border
                          transition-all duration-150
                          ${dh.closed ? 'border-white/5 opacity-50' : 'border-white/8 bg-white/[0.02]'}
                        `}
                      >
                        {/* Day label */}
                        <span className="text-xs font-medium text-slate-400 w-8 flex-shrink-0">
                          {DAY_LABELS[day]}
                        </span>

                        {/* Open/closed toggle */}
                        <button
                          type="button"
                          onClick={() => setDayHours(day, 'closed', !dh.closed)}
                          aria-label={`Toggle ${day} ${dh.closed ? 'open' : 'closed'}`}
                          className={`
                            relative w-8 h-4 rounded-full transition-colors duration-200 flex-shrink-0
                            ${dh.closed ? 'bg-white/10' : 'bg-amber-500'}
                          `}
                        >
                          <span className={`
                            absolute top-0.5 w-3 h-3 rounded-full bg-white shadow
                            transition-transform duration-200
                            ${dh.closed ? 'left-0.5' : 'left-4'}
                          `} />
                        </button>

                        {dh.closed ? (
                          <span className="text-xs text-slate-600 italic">Closed</span>
                        ) : (
                          <div className="flex items-center gap-1.5 flex-1 min-w-0">
                            <input
                              type="time"
                              value={dh.open}
                              onChange={(e) => setDayHours(day, 'open', e.target.value)}
                              aria-label={`${day} opening time`}
                              className="flex-1 min-w-0 rounded-lg bg-white/[0.04] border border-white/10 text-slate-200 text-xs px-2 py-1 focus:outline-none focus:border-amber-400/60 transition-colors"
                            />
                            <span className="text-slate-600 text-xs flex-shrink-0">–</span>
                            <input
                              type="time"
                              value={dh.close}
                              onChange={(e) => setDayHours(day, 'close', e.target.value)}
                              aria-label={`${day} closing time`}
                              className="flex-1 min-w-0 rounded-lg bg-white/[0.04] border border-white/10 text-slate-200 text-xs px-2 py-1 focus:outline-none focus:border-amber-400/60 transition-colors"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </FormCard>

              {/* API error */}
              {onboard.isError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
                  <AlertCircle size={15} className="flex-shrink-0" aria-hidden="true" />
                  {onboard.error?.message ?? 'Something went wrong. Please try again.'}
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                disabled={onboard.isPending}
                className="
                  w-full flex items-center justify-center gap-2
                  rounded-2xl py-3.5 h-auto
                  bg-gradient-to-r from-amber-500 to-orange-600 border-none
                  text-white font-semibold text-sm
                  shadow-lg shadow-orange-900/40
                  hover:shadow-xl hover:shadow-orange-900/60 hover:scale-[1.01]
                  disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100
                  transition-all duration-200
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60
                "
              >
                {onboard.isPending ? (
                  <><Loader2 size={16} className="animate-spin" /> Setting up your storefront…</>
                ) : (
                  <><CheckCircle2 size={16} /> Launch My Storefront <ChevronRight size={15} /></>
                )}
              </Button>
            </form>

            {/* ════ LIVE PREVIEW (tablet + desktop only) ════ */}
            <div className="hidden md:flex flex-col gap-3 sticky top-24">
              <p className="text-xs text-slate-500 uppercase tracking-widest font-medium text-center">
                Live Preview
              </p>
              <StorefrontPreview
                name={form.name}
                slug={form.slug}
                phoneNumber={form.phoneNumber}
                email={form.email}
                address={form.address}
                businessHours={form.businessHours}
              />
              <p className="text-[11px] text-slate-600 text-center leading-relaxed">
                Fill in the form to see your storefront update in real-time.
              </p>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

// ─── FormCard sub-component ───────────────────────────────────────────────────
function FormCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="rounded-2xl p-6 flex flex-col gap-5 border border-white/8"
      style={{ background: 'rgba(19,25,31,0.85)', backdropFilter: 'blur(16px)' }}
    >
      <div className="flex items-center gap-2.5 mb-1">
        <span className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center flex-shrink-0">
          {icon}
        </span>
        <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">{title}</h2>
      </div>
      {children}
    </section>
  );
}
