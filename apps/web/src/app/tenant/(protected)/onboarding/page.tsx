'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { trpc } from '@/trpc/client';
import Navbar from '@/components/Navbar';
import TenantProfileForm from '@/components/TenantProfileForm';
import type { RegisterTenantDto } from '@nummygo/shared/models/dtos';
import { registerTenantSchema } from '@nummygo/shared/models/dtos';
import { makeDefaultWeeklyHours } from '@/constants/tenant';
import { authClient } from '@/lib/auth-client';

// ─── Onboarding Page ──────────────────────────────────────────────────────────
export default function OnboardingPage() {
	const router = useRouter();
	const { data: session, isPending } = authClient.useSession();
	const { data: tenant, isLoading } = trpc.tenant.me.useQuery();
	const hasPopulatedForm = useRef(false);

	const onboard = trpc.tenant.onboard.useMutation({
		onSuccess: (data) => router.push(`/${data?.slug}`),
		onError: (error) => {
			console.log(error);
		},
	});

	const form = useForm<RegisterTenantDto>({
		resolver: zodResolver(registerTenantSchema),
		defaultValues: {
			name: '',
			slug: '',
			phoneNumber: '',
			email: '',
			address: '',
			businessHours: makeDefaultWeeklyHours(),
		},
		mode: 'onSubmit',
		reValidateMode: 'onChange',
	});

	// Redirect if already onboarded
	useEffect(() => {
		if (tenant?.onboardingCompleted) router.push(`/${tenant.slug}`);
	}, [tenant, router]);

	// Populate form with tenant data when it arrives (only once)
	useEffect(() => {
		if (tenant && !tenant.onboardingCompleted && !hasPopulatedForm.current) {
			hasPopulatedForm.current = true;
			form.reset({
				name: tenant.name || '',
				slug: tenant.slug || '',
				phoneNumber: tenant.phoneNumber || '',
				email: tenant.email || session?.user.email || '',
				address: tenant.address || '',
				businessHours: tenant.businessHours || makeDefaultWeeklyHours(),
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [tenant]);

	const handleSubmit = async (data: RegisterTenantDto) => {
		await onboard.mutateAsync(data);
	};

	// ── Loading state ──────────────────────────────────────────────────────────
	if (isLoading || isPending) {
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

	return (
		<>
			<Navbar />

			<div className="min-h-screen pt-20 pb-16 px-4 sm:px-6 lg:px-8" style={{ background: '#0D1117' }}>
				{/* Ambient glows — matches global brand palette */}
				<div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
					<div
						style={{
							position: 'absolute',
							top: '-10%',
							left: '-5%',
							width: 600,
							height: 600,
							borderRadius: '50%',
							background: 'radial-gradient(circle, rgba(251,191,36,0.10) 0%, transparent 70%)',
							filter: 'blur(40px)',
						}}
					/>
					<div
						style={{
							position: 'absolute',
							bottom: '5%',
							right: '-5%',
							width: 500,
							height: 500,
							borderRadius: '50%',
							background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
							filter: 'blur(40px)',
						}}
					/>
				</div>

				<div className="relative z-10 max-w-6xl mx-auto">
					{/* Page header */}
					<div className="text-center mb-10">
						<div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-4">
							<span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" aria-hidden="true" />
							Set up your storefront
						</div>
						<h1 className="text-3xl sm:text-4xl font-black text-slate-100">
							Welcome to <span className="gradient-text">nummyGo</span> 🔥
						</h1>
						<p className="text-slate-400 mt-3 max-w-md mx-auto text-sm leading-relaxed">
							Tell us about your restaurant. This information will appear on your public storefront — you
							can edit it any time from your profile.
						</p>
					</div>

					{/* Reusable form component */}
					<TenantProfileForm
						mode="onboarding"
						form={form}
						onSubmit={handleSubmit}
						isPending={onboard.isPending}
						isError={onboard.isError}
						error={onboard.error}
					/>
				</div>
			</div>
		</>
	);
}
