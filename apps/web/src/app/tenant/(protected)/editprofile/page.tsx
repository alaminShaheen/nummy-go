'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { trpc } from '@/trpc/client';
import Navbar from '@/components/Navbar';
import TenantProfileForm from '@/components/TenantProfileForm';
import type { UpdateTenantDto } from '@nummygo/shared/models/dtos';
import { updateTenantSchema } from '@nummygo/shared/models/dtos';
import { authClient } from '@/lib/auth-client';
import { ArrowLeft } from 'lucide-react';

// ─── Edit Profile Page ────────────────────────────────────────────────────────
export default function EditProfilePage() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const { data: session, isPending } = authClient.useSession();
	const { data: tenant, isLoading } = trpc.tenant.me.useQuery(undefined, { staleTime: Infinity });
	const hasPopulatedForm = useRef(false);

	const updateProfile = trpc.tenant.updateTenant.useMutation({
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [['tenant', 'me']] });
			router.push(`/${tenant?.slug}`);
		},
		onError: (error: any) => {
			console.log(error);
		},
	});

	const form = useForm<UpdateTenantDto>({
		resolver: zodResolver(updateTenantSchema),
		defaultValues: {},
		mode: 'onSubmit',
		reValidateMode: 'onChange',
	});

	// Populate form with tenant data when it arrives (only once)
	useEffect(() => {
		if (tenant && !hasPopulatedForm.current) {
			hasPopulatedForm.current = true;
			form.reset({
				name: tenant.name || undefined,
				slug: tenant.slug || undefined,
				phoneNumber: tenant.phoneNumber || undefined,
				email: tenant.email || session?.user.email || undefined,
				address: tenant.address || undefined,
				businessHours: tenant.businessHours || undefined,
				acceptsOrders: tenant.acceptsOrders ?? undefined,
				orderModificationThreshold: tenant.orderModificationThreshold ?? 30,
				promotionalHeading: tenant.promotionalHeading || undefined,
				description: tenant.description || undefined,
				tags: tenant.tags || undefined,
				logoUrl: tenant.logoUrl || undefined,
				heroImageUrl: tenant.heroImageUrl || undefined,
				acceptsDownpayment: tenant.acceptsDownpayment ?? false,
				downpaymentPercentage: tenant.downpaymentPercentage || undefined,
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [tenant]);

	const handleSubmit = async (data: UpdateTenantDto) => {
		await updateProfile.mutateAsync(data as any); // TODO: Create proper updateProfile mutation
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

	return (
		<>
			<Navbar />

			<div className="min-h-screen pt-20 pb-16 px-4 sm:px-6 lg:px-8" style={{ background: '#0D1117' }}>
				{/* Ambient glows */}
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
					<div className="mb-10">
						<button
							onClick={() => router.push(`/${tenant?.slug}`)}
							className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-300 text-sm mb-6 transition-colors"
						>
							<ArrowLeft size={16} />
							Back to Storefront
						</button>

						<div className="text-center">
							<div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-4">
								Edit Your Profile
							</div>
							<h1 className="text-3xl sm:text-4xl font-black text-slate-100">Restaurant Settings</h1>
							<p className="text-slate-400 mt-3 max-w-md mx-auto text-sm leading-relaxed">
								Update your restaurant information. Changes will be reflected on your public storefront
								immediately.
							</p>
						</div>
					</div>

					<TenantProfileForm
						mode="edit"
						form={form}
						onSubmit={handleSubmit}
						isPending={updateProfile.isPending}
						isError={updateProfile.isError}
						error={updateProfile.error}
						submitButtonText="Save Changes"
					/>
				</div>
			</div>
		</>
	);
}
