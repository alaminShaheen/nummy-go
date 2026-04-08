'use client';

import { ReactNode, useEffect, useState } from 'react';
import { Controller, type Path, type PathValue, type UseFormReturn } from 'react-hook-form';
import { useDebounceCallback } from 'usehooks-ts';
import { trpc } from '@/trpc/client';
import StorefrontPreview from '@/components/StorefrontPreview';
import { BrandInput, Button, FormField } from '@/components/ui';
import type { BusinessHours } from '@nummygo/shared/models/types';
import type { RegisterTenantDto, UpdateTenantDto } from '@nummygo/shared/models/dtos';
import { type Day, DAY_LABELS, DAYS, makeDefaultWeeklyHours } from '@/constants/tenant';
import { toSlug } from '@/utils/tenant';
import { AlertCircle, Building2, CheckCircle2, ChevronRight, Clock, Loader2, Phone, Power } from 'lucide-react';
import { clsx } from 'clsx';
import { TimePicker } from '@/components/TimePicker';

// ─── TenantProfileForm Props ──────────────────────────────────────────────────
type TenantFormValues = RegisterTenantDto | UpdateTenantDto;

type TenantProfileFormProps<T extends TenantFormValues> = {
	mode: 'onboarding' | 'edit';
	form: UseFormReturn<T>;
	onSubmit: (data: T) => Promise<void>;
	isPending: boolean;
	isError: boolean;
	error?: { message?: string } | null;
	submitButtonText?: string;
};

// ─── TenantProfileForm Component ──────────────────────────────────────────────
export default function TenantProfileForm<T extends TenantFormValues>(props: TenantProfileFormProps<T>) {
	const { mode, form, onSubmit, isPending, isError, error, submitButtonText } = props;

	const [slugManual, setSlugManual] = useState(false);
	const [slugAvailable, setSlugAvailable] = useState<boolean | null>(mode === 'edit' ? true : null);

	const {
		control,
		handleSubmit: rhfHandleSubmit,
		watch,
		setValue,
		setError,
		clearErrors,
		formState: { errors },
	} = form;

	// Watch all fields for live preview
	const formValues = watch() as RegisterTenantDto;
	const nameValue = watch('name' as Path<T>) as string | undefined;
	const slugValue = watch('slug' as Path<T>) as string | undefined;
	const acceptsOrdersValue = watch('acceptsOrders' as Path<T>) as boolean | undefined;

	// Lazy query - only runs when we call refetch()
	const checkSlugQuery = trpc.tenant.checkSlug.useQuery(
		{ slug: slugValue || '' },
		{ enabled: false, refetchOnWindowFocus: false }
	);

	// Debounced function to check slug availability
	const checkSlugAvailability = useDebounceCallback((slug: string) => {
		if (slug && slug.length >= 2 && mode === 'onboarding') {
			void checkSlugQuery.refetch();
		}
	}, 500);

	// Auto-generate slug from name (only in onboarding mode)
	useEffect(() => {
		if (mode === 'onboarding' && !slugManual) {
			const newSlug = toSlug(nameValue || '');
			setValue('slug' as Path<T>, newSlug as PathValue<T, Path<T>>, {
				shouldValidate: false,
				shouldTouch: false,
			});
			if (newSlug && newSlug.length >= 2) {
				checkSlugAvailability(newSlug);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [nameValue, slugManual, mode]);

	// Sync slug availability from query
	useEffect(() => {
		if (
			mode === 'onboarding' &&
			checkSlugQuery.fetchStatus === 'idle' &&
			checkSlugQuery.data !== undefined &&
			checkSlugQuery.dataUpdatedAt > 0
		) {
			setSlugAvailable(checkSlugQuery.data.available);
			if (!checkSlugQuery.data.available) {
				setError('slug' as Path<T>, { message: 'This slug is already taken' });
			} else {
				clearErrors('slug' as Path<T>);
			}
		}
	}, [mode, checkSlugQuery.data, checkSlugQuery.fetchStatus, checkSlugQuery.dataUpdatedAt, setError, clearErrors]);

	const setDayHours = (day: Day, field: keyof BusinessHours['monday'], value: string | boolean) => {
		const currentHours =
			(watch('businessHours' as Path<T>) as BusinessHours | undefined) || makeDefaultWeeklyHours();
		setValue(
			'businessHours' as Path<T>,
			{
				...currentHours,
				[day]: { ...currentHours[day], [field]: value },
			} as PathValue<T, Path<T>>,
			{ shouldValidate: false }
		);
	};

	const handleFormSubmit = async (data: T) => {
		if (mode === 'onboarding' && slugAvailable === false) {
			setError('slug' as Path<T>, { message: 'This slug is already taken' });
			return;
		}
		await onSubmit(data);
	};

	// Slug availability indicator (only for onboarding)
	const slugSuffix =
		mode === 'onboarding' && slugValue && slugValue.length >= 2 ? (
			checkSlugQuery.isFetching ? (
				<Loader2 size={13} className="text-slate-500 animate-spin" />
			) : slugAvailable === true ? (
				<CheckCircle2 size={13} className="text-green-400" />
			) : slugAvailable === false ? (
				<AlertCircle size={13} className="text-rose-400" />
			) : null
		) : null;

	return (
		<div className="grid md:grid-cols-[1fr_380px] lg:grid-cols-[1fr_420px] gap-6 items-start">
			{/* ════ FORM ════ */}
			<form
				onSubmit={rhfHandleSubmit(handleFormSubmit)}
				noValidate
				className="flex flex-col gap-5"
				aria-label={mode === 'onboarding' ? 'Restaurant onboarding form' : 'Edit restaurant profile'}
			>
				{/* ── Card: Basic Info ── */}
				<FormCard icon={<Building2 size={15} />} title="Basic Info">
					<Controller
						name={'name' as Path<T>}
						control={control}
						render={({ field }) => (
							<FormField id="name" label="Restaurant Name" required error={(errors as any).name?.message}>
								<BrandInput
									id="name"
									{...field}
									value={(field.value as string) ?? ''}
									placeholder="The Golden Fork"
									autoFocus
								/>
							</FormField>
						)}
					/>

					<Controller
						name={'slug' as Path<T>}
						control={control}
						render={({ field }) => (
							<FormField
								id="slug"
								label="Your nummyGo URL"
								required
								hint={
									!(errors as any).slug ? 'Lowercase letters, numbers and hyphens only.' : undefined
								}
							>
								<BrandInput
									id="slug"
									{...field}
									value={(field.value as string) ?? ''}
									onChange={(e) => {
										if (mode === 'onboarding') {
											setSlugManual(true);
											const newSlug = toSlug(e.target.value);
											field.onChange(newSlug);

											if (newSlug.length >= 2) {
												setSlugAvailable(null);
												checkSlugAvailability(newSlug);
											} else {
												setSlugAvailable(null);
											}
										}
									}}
									placeholder="the-golden-fork"
									prefix="nummygo.com/"
									suffix={slugSuffix}
									disabled={mode === 'edit'}
								/>
								{mode === 'onboarding' && slugValue && slugValue.length >= 2 && (
									<>
										{checkSlugQuery.isFetching || slugAvailable === null ? (
											<p className="text-xs text-amber-400 flex items-center gap-1 mt-0.5">
												<Loader2 size={13} className="animate-spin" /> Checking
											</p>
										) : slugAvailable ? (
											<p className="text-xs text-green-400 flex items-center gap-1 mt-0.5">
												<CheckCircle2 size={11} aria-hidden="true" /> Available!
											</p>
										) : (
											<p className="text-xs text-rose-400 flex items-center gap-1 mt-0.5">
												<AlertCircle size={13} className="text-rose-400" />
												{(errors as any).slug?.message || 'Not Available!'}
											</p>
										)}
									</>
								)}
							</FormField>
						)}
					/>
				</FormCard>

				{/* ── Card: Contact ── */}
				<FormCard icon={<Phone size={15} />} title="Contact">
					<Controller
						name={'phoneNumber' as Path<T>}
						control={control}
						render={({ field }) => (
							<FormField
								id="phoneNumber"
								label="Phone Number"
								required
								error={(errors as any).phoneNumber?.message}
								hint="Customers will use this to call you."
							>
								<BrandInput
									id="phoneNumber"
									type="tel"
									{...field}
									value={(field.value as string) ?? ''}
									placeholder="+1 (416) 555-0100"
								/>
							</FormField>
						)}
					/>

					<Controller
						name={'email' as Path<T>}
						control={control}
						render={({ field }) => (
							<FormField
								id="email"
								label="Email Address"
								error={(errors as any).email?.message}
								hint="Optional — shown on your storefront for customer enquiries."
							>
								<BrandInput
									id="email"
									type="email"
									{...field}
									value={(field.value as string) ?? ''}
									placeholder="hello@yourrestaurant.com"
								/>
							</FormField>
						)}
					/>

					<Controller
						name={'address' as Path<T>}
						control={control}
						render={({ field }) => (
							<FormField
								id="address"
								label="Business Address"
								required
								error={(errors as any).address?.message}
								hint="Where customers can find you. This will open Google Maps when clicked."
							>
								<BrandInput
									id="address"
									{...field}
									value={(field.value as string) ?? ''}
									placeholder="123 Main St, New York, NY 10001"
								/>
							</FormField>
						)}
					/>
				</FormCard>

				{/* ── Card: Availability ── */}
				{mode === 'edit' && (
					<FormCard icon={<Power size={15} />} title="Availability">
						<Controller
							name={'acceptsOrders' as Path<T>}
							control={control}
							render={({ field }) => (
								<FormField
									id="acceptsOrders"
									label="Accepting Orders"
									hint="Toggle this to pause or resume accepting orders from customers."
								>
									<div className="flex items-center gap-3">
										<button
											type="button"
											onClick={() => field.onChange(!field.value)}
											aria-label={`Toggle accepting orders ${field.value ? 'off' : 'on'}`}
											className={clsx(
												'relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0',
												{
													'bg-green-500': field.value,
													'bg-slate-600': !field.value,
												}
											)}
										>
											<span
												className={clsx(
													'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200',
													{
														'left-5': field.value,
														'left-0.5': !field.value,
													}
												)}
											/>
										</button>
										<span
											className={clsx('text-sm font-medium', {
												'text-green-400': field.value,
												'text-slate-400': !field.value,
											})}
										>
											{field.value ? 'Open for Orders' : 'Temporarily Closed'}
										</span>
									</div>
								</FormField>
							)}
						/>

						<Controller
							name={'orderModificationThreshold' as Path<T>}
							control={control}
							render={({ field }) => (
								<FormField
									id="orderModificationThreshold"
									label="Order Modification Window (Minutes)"
									hint="Customers can modify or cancel their order within this time limit."
								>
									<select
										id="orderModificationThreshold"
										// @ts-ignore - The value will map correctly locally
										value={(field.value as number) || 30}
										onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
										className="w-full rounded-lg bg-[#141A23] border border-white/10 text-slate-200 text-sm px-3 py-2.5 focus:outline-none focus:border-amber-400/60 transition-colors appearance-none"
									>
										<option value={15} className="bg-[#141A23]">15 minutes</option>
										<option value={30} className="bg-[#141A23]">30 minutes</option>
										<option value={45} className="bg-[#141A23]">45 minutes</option>
										<option value={60} className="bg-[#141A23]">60 minutes</option>
									</select>
								</FormField>
							)}
						/>

						{/* TODO: Add later */}
						{/*{!acceptsOrdersValue && (*/}
						{/*	<Controller*/}
						{/*		name={'closedUntil' as Path<T>}*/}
						{/*		control={control}*/}
						{/*		render={({ field }) => (*/}
						{/*			<FormField*/}
						{/*				id="closedUntil"*/}
						{/*				label="Reopen At"*/}
						{/*				hint="Optional — specify when you'll start accepting orders again."*/}
						{/*			>*/}
						{/*				<input*/}
						{/*					type="datetime-local"*/}
						{/*					value={*/}
						{/*						field.value*/}
						{/*							? new Date(field.value as number).toISOString().slice(0, 16)*/}
						{/*							: ''*/}
						{/*					}*/}
						{/*					onChange={(e) => {*/}
						{/*						const value = e.target.value*/}
						{/*							? new Date(e.target.value).getTime()*/}
						{/*							: null;*/}
						{/*						field.onChange(value);*/}
						{/*					}}*/}
						{/*					className={clsx(*/}
						{/*						'w-full rounded-lg bg-white/[0.04] border',*/}
						{/*						'border-white/10 text-slate-200 text-sm px-3 py-2 focus:outline-none',*/}
						{/*						'focus:border-amber-400/60 transition-colors'*/}
						{/*					)}*/}
						{/*				/>*/}
						{/*			</FormField>*/}
						{/*		)}*/}
						{/*	/>*/}
						{/*)}*/}
					</FormCard>
				)}

				{/* ── Card: Business Hours ── */}
				<FormCard icon={<Clock size={15} />} title="Business Hours">
					<div className="flex flex-col gap-2">
						{DAYS.map((day) => {
							const dh = formValues.businessHours?.[day];
							if (!dh) return null;
							return (
								<div
									key={day}
									className={clsx(
										'flex items-center gap-3 rounded-xl px-3 py-2.5 border transition-all duration-150',
										{
											'border-white/5 opacity-50': dh.closed,
											'border-white/8 bg-white/[0.02]': !dh.closed,
										}
									)}
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
										className={clsx(
											'relative w-8 h-4 rounded-full transition-colors duration-200 flex-shrink-0',
											{
												'bg-white/10': dh.closed,
												'bg-amber-500': !dh.closed,
											}
										)}
									>
										<span
											className={clsx(
												'absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform duration-200',
												{
													'left-0.5': dh.closed,
													'left-4': !dh.closed,
												}
											)}
										/>
									</button>

									{dh.closed ? (
										<span className="text-xs text-slate-600 italic">Closed</span>
									) : (
										<div className="flex items-center gap-1.5 flex-1 min-w-0">
											<Controller
												name={`businessHours.${day}.open` as Path<T>}
												control={control}
												render={({ field }) => {
													const [hour = '00', minute = '00'] =
														(field.value as string | undefined)?.split(':') ?? [];

													return (
														<TimePicker
															value={{ hour, minute }}
															onChange={(time) => {
																setDayHours(day, 'open', `${time.hour}:${time.minute}`);
																// field.onChange(``);
															}}
														/>
													);
												}}
											/>
											<span className="text-slate-600 text-xs flex-shrink-0">–</span>
											<Controller
												name={`businessHours.${day}.close` as Path<T>}
												control={control}
												render={({ field }) => {
													const [hour = '00', minute = '00'] =
														(field.value as string | undefined)?.split(':') ?? [];

													return (
														<TimePicker
															value={{ hour, minute }}
															onChange={(time) => {
																setDayHours(day, 'open', `${time.hour}:${time.minute}`);
															}}
														/>
													);
												}}
											/>
										</div>
									)}
								</div>
							);
						})}
					</div>
				</FormCard>

				{/* API error */}
				{isError && (
					<div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
						<AlertCircle size={15} className="flex-shrink-0" aria-hidden="true" />
						{error?.message ?? 'Something went wrong. Please try again.'}
					</div>
				)}

				{/* Submit */}
				<Button
					type="submit"
					disabled={isPending}
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
					{isPending ? (
						<>
							<Loader2 size={16} className="animate-spin" />{' '}
							{mode === 'onboarding' ? 'Setting up your storefront…' : 'Saving changes…'}
						</>
					) : (
						<>
							<CheckCircle2 size={16} />{' '}
							{submitButtonText || (mode === 'onboarding' ? 'Launch My Storefront' : 'Save Changes')}
							<ChevronRight size={15} />
						</>
					)}
				</Button>
			</form>

			{/* ════ LIVE PREVIEW (tablet + desktop only) ════ */}
			<div className="hidden md:flex flex-col gap-3 sticky top-24">
				<p className="text-xs text-slate-500 uppercase tracking-widest font-medium text-center">Live Preview</p>
				<StorefrontPreview
					acceptsOrders={(formValues as UpdateTenantDto).acceptsOrders ?? true}
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
	);
}

// ─── FormCard sub-component ───────────────────────────────────────────────────
function FormCard({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
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
