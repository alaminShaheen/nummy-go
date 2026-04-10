'use client';

import { ReactNode, useEffect, useState } from 'react';
import { Controller, type Path, type PathValue, type UseFormReturn } from 'react-hook-form';
import { useDebounceCallback } from 'usehooks-ts';
import { trpc } from '@/trpc/client';
import StorefrontPreview from '@/components/StorefrontPreview';
import { BrandInput, Button, FormField, FormCard, ImageDropzone, TagsInput, BrandSwitch, AddressAutocomplete } from '@/components/ui';
import type { BusinessHours } from '@nummygo/shared/models/types';
import type { RegisterTenantDto, UpdateTenantDto } from '@nummygo/shared/models/dtos';
import { type Day, DAY_LABELS, DAYS, makeDefaultWeeklyHours } from '@/constants/tenant';
import { toSlug } from '@/utils/tenant';
import { AlertCircle, Building2, CheckCircle2, ChevronRight, Clock, Globe, Loader2, Phone, Power, Share2, Wallet, Image as ImageIcon } from 'lucide-react';
import type { SocialLinks } from '@nummygo/shared/models/types';
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
				className="flex flex-col gap-5 min-w-0 w-full"
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

					<Controller
						name={'promotionalHeading' as Path<T>}
						control={control}
						render={({ field }) => (
							<FormField id="promotionalHeading" label="Promotional Heading" error={(errors as any).promotionalHeading?.message} hint="Optional — replaces your restaurant name in the hero banner.">
								<BrandInput
									id="promotionalHeading"
									{...field}
									value={(field.value as string) ?? ''}
									placeholder="Award winning Pizza!"
								/>
							</FormField>
						)}
					/>

					<Controller
						name={'description' as Path<T>}
						control={control}
						render={({ field }) => (
							<FormField id="description" label="Description" error={(errors as any).description?.message} hint="Optional — a short tagline beneath the hero banner.">
								<BrandInput
									id="description"
									{...field}
									value={(field.value as string) ?? ''}
									placeholder="Best pizza in town baked in a wood-fired oven."
								/>
							</FormField>
						)}
					/>

					<Controller
						name={'tags' as Path<T>}
						control={control}
						render={({ field }) => (
							<FormField
								id="tags"
								label="Restaurant Tags"
								error={(errors as any).tags?.message}
								hint="Optional — Enter category tags separated by commas."
							>
								<TagsInput
									id="tags"
									value={field.value as string[] | undefined}
									onChange={field.onChange}
									placeholder="🍔 Burgers, 🍝 Pasta, Halal"
								/>
							</FormField>
						)}
					/>
				</FormCard>

				{/* ── Card: Branding & Artwork ── */}
				<FormCard icon={<ImageIcon size={15} />} title="Branding & Artwork">
					<div className="flex flex-col md:flex-row gap-6 items-start">
						{/* Logo Upload */}
						<div className="shrink-0">
							<Controller
								name={'logoUrl' as Path<T>}
								control={control}
								render={({ field }) => (
									<ImageDropzone
										label="Brand Logo"
										hint="Recommended square (e.g. 512x512)"
										isAvatar={true}
										value={field.value as string | undefined}
										onChange={field.onChange}
									/>
								)}
							/>
						</div>

						{/* Hero Banner Upload */}
						<div className="flex-1 w-full">
							<Controller
								name={'heroImageUrl' as Path<T>}
								control={control}
								render={({ field }) => (
									<ImageDropzone
										label="Hero Banner Background"
										hint="Recommended wide format (e.g. 1600x400)"
										isAvatar={false}
										value={field.value as string | undefined}
										onChange={field.onChange}
									/>
								)}
							/>
						</div>
					</div>
				</FormCard>

				{/* ── Card: Social Links ── */}
				<FormCard icon={<Share2 size={15} />} title="Social Links">
					<p className="text-xs text-slate-500 mb-4">Add your social media profiles. These will appear on your public storefront.</p>

					<Controller
						name={'socialLinks.instagram' as Path<T>}
						control={control}
						render={({ field }) => (
							<FormField id="socialLinks.instagram" label="Instagram" error={(errors as any).socialLinks?.instagram?.message}>
								<BrandInput
									id="socialLinks.instagram"
									{...field}
									value={(field.value as string) ?? ''}
									placeholder="https://instagram.com/yourrestaurant"
									prefix={<SocialIcon platform="instagram" />}
								/>
							</FormField>
						)}
					/>

					<Controller
						name={'socialLinks.facebook' as Path<T>}
						control={control}
						render={({ field }) => (
							<FormField id="socialLinks.facebook" label="Facebook" error={(errors as any).socialLinks?.facebook?.message}>
								<BrandInput
									id="socialLinks.facebook"
									{...field}
									value={(field.value as string) ?? ''}
									placeholder="https://facebook.com/yourrestaurant"
									prefix={<SocialIcon platform="facebook" />}
								/>
							</FormField>
						)}
					/>

					<Controller
						name={'socialLinks.twitter' as Path<T>}
						control={control}
						render={({ field }) => (
							<FormField id="socialLinks.twitter" label="X (Twitter)" error={(errors as any).socialLinks?.twitter?.message}>
								<BrandInput
									id="socialLinks.twitter"
									{...field}
									value={(field.value as string) ?? ''}
									placeholder="https://x.com/yourrestaurant"
									prefix={<SocialIcon platform="twitter" />}
								/>
							</FormField>
						)}
					/>

					<Controller
						name={'socialLinks.tiktok' as Path<T>}
						control={control}
						render={({ field }) => (
							<FormField id="socialLinks.tiktok" label="TikTok" error={(errors as any).socialLinks?.tiktok?.message}>
								<BrandInput
									id="socialLinks.tiktok"
									{...field}
									value={(field.value as string) ?? ''}
									placeholder="https://tiktok.com/@yourrestaurant"
									prefix={<SocialIcon platform="tiktok" />}
								/>
							</FormField>
						)}
					/>

					<Controller
						name={'socialLinks.website' as Path<T>}
						control={control}
						render={({ field }) => (
							<FormField id="socialLinks.website" label="Website" error={(errors as any).socialLinks?.website?.message}>
								<BrandInput
									id="socialLinks.website"
									{...field}
									value={(field.value as string) ?? ''}
									placeholder="https://yourrestaurant.com"
									prefix={<Globe size={14} className="text-slate-400" />}
								/>
							</FormField>
						)}
					/>
				</FormCard>

				{/* ── Card: Contact ── */}
				<FormCard icon={<Phone size={15} />} title="Contact" className="z-50">
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
								<AddressAutocomplete
									id="address"
									value={(field.value as string) ?? ''}
									placeholder="123 Main St, New York, NY 10001"
									error={!!(errors as any).address?.message}
									onChange={(addr, lat, lng) => {
										field.onChange(addr);
										if (lat !== undefined && lng !== undefined) {
											(form.setValue as any)('latitude', lat, { shouldDirty: true });
											(form.setValue as any)('longitude', lng, { shouldDirty: true });
										} else {
											(form.setValue as any)('latitude', null, { shouldDirty: true });
											(form.setValue as any)('longitude', null, { shouldDirty: true });
										}
									}}
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
									<div className="flex items-center gap-3 py-2">
										<BrandSwitch
											checked={field.value as boolean}
											onChange={field.onChange}
											ariaLabel={`Toggle accepting orders ${field.value ? 'off' : 'on'}`}
										/>
										<span
											className={clsx('text-sm font-medium', {
												'text-amber-400': field.value,
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
									<BrandSwitch
										checked={!dh.closed}
										onChange={(c) => setDayHours(day, 'closed', !c)}
										ariaLabel={`Toggle ${day} ${dh.closed ? 'open' : 'closed'}`}
									/>

									{dh.closed ? (
										<span className="text-xs text-slate-600 italic">Closed</span>
									) : (
										<div className="flex flex-col min-[450px]:flex-row items-stretch min-[450px]:items-center gap-1.5 flex-1 min-w-0">
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
											<span className="text-slate-600 text-xs flex-shrink-0 hidden min-[450px]:inline-block text-center">–</span>
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
			<div className="hidden md:block self-stretch">
			<div className="sticky top-8 flex flex-col gap-3">
				<p className="text-xs text-slate-500 uppercase tracking-widest font-medium text-center">Live Preview</p>
				<StorefrontPreview
					acceptsOrders={(formValues as UpdateTenantDto).acceptsOrders ?? true}
					name={formValues.name}
					slug={formValues.slug}
					phoneNumber={formValues.phoneNumber}
					email={formValues.email}
					address={formValues.address}
					businessHours={formValues.businessHours}
					promotionalHeading={(formValues as UpdateTenantDto).promotionalHeading}
					description={(formValues as UpdateTenantDto).description}
					tags={(formValues as UpdateTenantDto).tags}
					logoUrl={(formValues as UpdateTenantDto).logoUrl}
					heroImageUrl={(formValues as UpdateTenantDto).heroImageUrl}
					socialLinks={(formValues as UpdateTenantDto).socialLinks as SocialLinks | undefined}
				/>
				<p className="text-[11px] text-slate-600 text-center leading-relaxed">
					Fill in the form to see your storefront update in real-time.
				</p>
			</div>
			</div>
		</div>
	);
}

// ─── Social platform SVG icons ────────────────────────────────────────────────
function SocialIcon({ platform }: { platform: string }) {
	const cls = 'w-3.5 h-3.5 flex-shrink-0';
	switch (platform) {
		case 'instagram':
			return (
				<svg viewBox="0 0 24 24" className={cls} fill="none" stroke="#E4405F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
					<rect x="2" y="2" width="20" height="20" rx="5" />
					<circle cx="12" cy="12" r="5" />
					<circle cx="17.5" cy="6.5" r="1.5" fill="#E4405F" stroke="none" />
				</svg>
			);
		case 'facebook':
			return (
				<svg viewBox="0 0 24 24" className={cls} fill="#1877F2">
					<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
				</svg>
			);
		case 'twitter':
			return (
				<svg viewBox="0 0 24 24" className={cls} fill="#94a3b8">
					<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
				</svg>
			);
		case 'tiktok':
			return (
				<svg viewBox="0 0 24 24" className={cls} fill="#94a3b8">
					<path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.11V9.01A6.29 6.29 0 004 15.28a6.29 6.29 0 006.28 6.28 6.29 6.29 0 006.28-6.28V9.33a8.24 8.24 0 004.84 1.56V7.44a4.85 4.85 0 01-1.81-.75z"/>
				</svg>
			);
		default:
			return null;
	}
}
