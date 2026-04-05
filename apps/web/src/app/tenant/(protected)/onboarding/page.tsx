'use client';

import {useEffect, useRef, useState} from 'react';
import {useRouter} from 'next/navigation';
import {Controller, useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {useDebounceCallback} from 'usehooks-ts';
import {trpc} from '@/trpc/client';
import Navbar from '@/components/Navbar';
import StorefrontPreview from '@/components/StorefrontPreview';
import {BrandInput, Button, FormField} from '@/components/ui';
import type {BusinessHours} from '@nummygo/shared/models/types';
import type {RegisterTenantDto} from '@nummygo/shared/models/dtos';
import {registerTenantSchema} from '@nummygo/shared/models/dtos';
import {type Day, DAY_LABELS, DAYS, makeDefaultWeeklyHours} from '@/constants/tenant';
import {toSlug} from '@/utils/tenant';
import {AlertCircle, Building2, CheckCircle2, ChevronRight, Clock, Loader2, Phone,} from 'lucide-react';

// ─── Onboarding Page ──────────────────────────────────────────────────────────
export default function OnboardingPage() {
    const router = useRouter();
    const {data: tenant, isLoading} = trpc.tenant.me.useQuery();
    const onboard = trpc.tenant.onboard.useMutation({
        onSuccess: (data) => router.push(`/${data?.slug}`),
        onError: (error) => {
            console.log(error);
        }
    });

    const [slugManual, setSlugManual] = useState(false);
    const [slugAvailable, setSlugAvailable] = useState<boolean | null>(true);
    const hasPopulatedForm = useRef(false);

    const {
        control,
        handleSubmit: rhfHandleSubmit,
        watch,
        setValue,
        setError,
        clearErrors,
        reset,
        formState: {errors},
    } = useForm<RegisterTenantDto>({
        resolver: zodResolver(registerTenantSchema),
        defaultValues: {
            name: '',
            slug: '',
            phoneNumber: '',
            email: '',
            address: '',
            businessHours: makeDefaultWeeklyHours(),
        },
        mode: 'onSubmit', // Only validate on submit
        reValidateMode: 'onChange', // After first submit, revalidate on change
    });

    // Watch all fields for live preview
    const formValues = watch();
    const nameValue = watch('name');
    const slugValue = watch('slug');

    // Lazy query - only runs when we call refetch()
    const checkSlugQuery = trpc.tenant.checkSlug.useQuery(
        {slug: slugValue},
        {enabled: false, refetchOnWindowFocus: false},
    );

    // Debounced function to check slug availability
    const checkSlugAvailability = useDebounceCallback((slug: string) => {
        if (slug && slug.length >= 2) {
            void checkSlugQuery.refetch();
        }
    }, 500);

    // Redirect if already onboarded
    useEffect(() => {
        if (tenant?.onboardingCompleted) router.push(`/${tenant.slug}`);
    }, [tenant, router]);

    // Populate form with tenant data when it arrives (only once)
    useEffect(() => {
        if (tenant && !tenant.onboardingCompleted && !hasPopulatedForm.current) {
            hasPopulatedForm.current = true;
            reset({
                name: tenant.name || '',
                slug: tenant.slug || '',
                phoneNumber: tenant.phoneNumber || '',
                email: tenant.email || '',
                address: tenant.address || '',
                businessHours: tenant.businessHours || makeDefaultWeeklyHours(),
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tenant]); // reset and checkSlugAvailability are stable

    // Auto-generate slug from name
    useEffect(() => {
        if (!slugManual) {
            const newSlug = toSlug(nameValue || '');
            setValue('slug', newSlug, {shouldValidate: false, shouldTouch: false});
            if (newSlug && newSlug.length >= 2) {
                checkSlugAvailability(newSlug);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [nameValue, slugManual]); // checkSlugAvailability is stable from useDebounceCallback

    // Sync slug availability from query
    useEffect(() => {
        // Only update when:
        // 1. Query is idle (not fetching)
        // 2. We have data
        // 3. Query was explicitly fetched (dataUpdatedAt > 0)
        if (
            checkSlugQuery.fetchStatus === 'idle' &&
            checkSlugQuery.data !== undefined &&
            checkSlugQuery.dataUpdatedAt > 0
        ) {
            setSlugAvailable(checkSlugQuery.data.available);
            if (!checkSlugQuery.data.available) {
                setError('slug', {message: 'This slug is already taken'});
            } else {
                clearErrors('slug');
            }
        }
    }, [checkSlugQuery.data, checkSlugQuery.fetchStatus, checkSlugQuery.dataUpdatedAt, setError, clearErrors]);

    const setDayHours = (day: Day, field: keyof BusinessHours['monday'], value: string | boolean) => {
        const currentHours = watch('businessHours') || makeDefaultWeeklyHours();
        setValue('businessHours', {
            ...currentHours,
            [day]: {...currentHours[day], [field]: value},
        }, {shouldValidate: false});
    };

    const onSubmit = async (data: RegisterTenantDto) => {
        if (slugAvailable === false) {
            setError('slug', {message: 'This slug is already taken'});
            return;
        }
        await onboard.mutateAsync(data);
    };

    // ── Loading state ──────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{background: '#0D1117'}}>
                <div className="flex flex-col items-center gap-4">
                    <div
                        className="w-10 h-10 rounded-full border-2 border-amber-400/30 border-t-amber-400 animate-spin"/>
                    <p className="text-slate-500 text-sm">Loading your profile…</p>
                </div>
            </div>
        );
    }

    if (tenant?.onboardingCompleted) return null;

    // ── Slug availability indicator (passed to BrandInput suffix) ─────────────
    const slugSuffix = slugValue && slugValue.length >= 2
        ? checkSlugQuery.isFetching
            ? <Loader2 size={13} className="text-slate-500 animate-spin"/>
            : slugAvailable === true
                ? <CheckCircle2 size={13} className="text-green-400"/>
                : slugAvailable === false
                    ? <AlertCircle size={13} className="text-rose-400"/>
                    : null
        : null;

    return (
        <>
            <Navbar/>

            <div className="min-h-screen pt-20 pb-16 px-4 sm:px-6 lg:px-8" style={{background: '#0D1117'}}>
                {/* Ambient glows — matches global brand palette */}
                <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
                    <div style={{
                        position: 'absolute', top: '-10%', left: '-5%',
                        width: 600, height: 600, borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(251,191,36,0.10) 0%, transparent 70%)',
                        filter: 'blur(40px)',
                    }}/>
                    <div style={{
                        position: 'absolute', bottom: '5%', right: '-5%',
                        width: 500, height: 500, borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
                        filter: 'blur(40px)',
                    }}/>
                </div>

                <div className="relative z-10 max-w-6xl mx-auto">

                    {/* Page header */}
                    <div className="text-center mb-10">
                        <div
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-4">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" aria-hidden="true"/>
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
                            onSubmit={rhfHandleSubmit(onSubmit)}
                            noValidate
                            className="flex flex-col gap-5"
                            aria-label="Restaurant onboarding form"
                        >
                            {/* ── Card: Basic Info ── */}
                            <FormCard icon={<Building2 size={15}/>} title="Basic Info">
                                <Controller
                                    name="name"
                                    control={control}
                                    render={({field}) => (
                                        <FormField id="name" label="Restaurant Name" required
                                                   error={errors.name?.message}>
                                            <BrandInput
                                                id="name"
                                                {...field}
                                                placeholder="The Golden Fork"
                                                autoFocus
                                            />
                                        </FormField>
                                    )}
                                />

                                <Controller
                                    name="slug"
                                    control={control}
                                    render={({field}) => (
                                        <FormField
                                            id="slug"
                                            label="Your nummyGo URL"
                                            required
                                            hint={!errors.slug ? 'Lowercase letters, numbers and hyphens only.' : undefined}
                                        >
                                            <BrandInput
                                                id="slug"
                                                {...field}
                                                onChange={(e) => {
                                                    setSlugManual(true);
                                                    const newSlug = toSlug(e.target.value);
                                                    field.onChange(newSlug);

                                                    // Reset availability state while checking
                                                    if (newSlug.length >= 2) {
                                                        setSlugAvailable(null);
                                                        checkSlugAvailability(newSlug);
                                                    } else {
                                                        setSlugAvailable(null);
                                                    }
                                                }}
                                                placeholder="the-golden-fork"
                                                prefix="nummygo.com/"
                                                suffix={slugSuffix}
                                            />
                                            {
                                                slugValue && slugValue.length >= 2 &&
                                                <>
                                                    {checkSlugQuery.isFetching || slugAvailable === null ?
                                                        (
                                                            <p className="text-xs text-amber-400 flex items-center gap-1 mt-0.5">
                                                                <Loader2 size={13} className="animate-spin"/> Checking
                                                            </p>
                                                        )
                                                        :
                                                        slugAvailable ? (
                                                                <p className="text-xs text-green-400 flex items-center gap-1 mt-0.5">
                                                                    <CheckCircle2 size={11} aria-hidden="true"/> Available!
                                                                </p>
                                                            ) :
                                                            <p className="text-xs text-rose-400 flex items-center gap-1 mt-0.5">
                                                                <AlertCircle size={13} className="text-rose-400"/>
                                                                {errors.slug?.message || "Not Available!"}
                                                            </p>
                                                    }

                                                </>
                                            }
                                        </FormField>
                                    )}
                                />
                            </FormCard>

                            {/* ── Card: Contact ── */}
                            <FormCard icon={<Phone size={15}/>} title="Contact">
                                <Controller
                                    name="phoneNumber"
                                    control={control}
                                    render={({field}) => (
                                        <FormField
                                            id="phoneNumber"
                                            label="Phone Number"
                                            required
                                            error={errors.phoneNumber?.message}
                                            hint="Customers will use this to call you."
                                        >
                                            <BrandInput
                                                id="phoneNumber"
                                                type="tel"
                                                {...field}
                                                placeholder="+1 (416) 555-0100"
                                            />
                                        </FormField>
                                    )}
                                />

                                <Controller
                                    name="email"
                                    control={control}
                                    render={({field}) => (
                                        <FormField
                                            id="email"
                                            label="Email Address"
                                            error={errors.email?.message}
                                            hint="Optional — shown on your storefront for customer enquiries."
                                        >
                                            <BrandInput
                                                id="email"
                                                type="email"
                                                {...field}
                                                placeholder="hello@yourrestaurant.com"
                                            />
                                        </FormField>
                                    )}
                                />

                                <Controller
                                    name="address"
                                    control={control}
                                    render={({field}) => (
                                        <FormField
                                            id="address"
                                            label="Business Address"
                                            required
                                            error={errors.address?.message}
                                            hint="Where customers can find you. This will open Google Maps when clicked."
                                        >
                                            <BrandInput
                                                id="address"
                                                {...field}
                                                placeholder="123 Main St, New York, NY 10001"
                                            />
                                        </FormField>
                                    )}
                                />
                            </FormCard>

                            {/* ── Card: Business Hours ── */}
                            <FormCard icon={<Clock size={15}/>} title="Business Hours">
                                <div className="flex flex-col gap-2">
                                    {DAYS.map((day) => {
                                        const dh = formValues.businessHours?.[day];
                                        if (!dh) return null;
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
                          `}/>
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
                                <div
                                    className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
                                    <AlertCircle size={15} className="flex-shrink-0" aria-hidden="true"/>
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
                                    <><Loader2 size={16} className="animate-spin"/> Setting up your storefront…</>
                                ) : (
                                    <><CheckCircle2 size={16}/> Launch My Storefront <ChevronRight size={15}/></>
                                )}
                            </Button>
                        </form>

                        {/* ════ LIVE PREVIEW (tablet + desktop only) ════ */}
                        <div className="hidden md:flex flex-col gap-3 sticky top-24">
                            <p className="text-xs text-slate-500 uppercase tracking-widest font-medium text-center">
                                Live Preview
                            </p>
                            <StorefrontPreview
                                name={formValues.name}
                                slug={formValues.slug}
                                phoneNumber={formValues.phoneNumber}
                                email={formValues.email}
                                address={formValues.address}
                                businessHours={formValues.businessHours}
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
            style={{background: 'rgba(19,25,31,0.85)', backdropFilter: 'blur(16px)'}}
        >
            <div className="flex items-center gap-2.5 mb-1">
        <span
            className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center flex-shrink-0">
          {icon}
        </span>
                <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">{title}</h2>
            </div>
            {children}
        </section>
    );
}
