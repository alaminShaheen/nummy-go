'use client';

/**
 * apps/web/src/components/StorefrontPreview.tsx
 *
 * A browser-chrome mockup that shows a real-time preview of how a tenant's
 * storefront page will look to customers. Designed to be reused by both
 * the Onboarding page and the Edit Profile page.
 *
 * Props map to RegisterTenantDto fields for consistency.
 */

import { Clock, Link as LinkIcon, Mail, MapPin, Phone } from 'lucide-react';
import type { BusinessHours } from '@nummygo/shared/models/types';
import { DAY_LABELS, DAYS } from '@/constants/tenant';
import { fmt24To12 } from '@/utils/tenant';

export interface StorefrontPreviewProps {
	name: string;
	slug: string;
	phoneNumber: string;
	email?: string;
	address?: string;
	businessHours?: BusinessHours;
	acceptsOrders?: boolean;
	promotionalHeading?: string | null;
	description?: string | null;
	tags?: string[] | null;
	heroImageUrl?: string | null;
	logoUrl?: string | null;
	// TODO: Add it later
	// closedUntil?: number | null;
}

export default function StorefrontPreview({
	name,
	slug,
	phoneNumber,
	email,
	address,
	businessHours,
	acceptsOrders = true,
	promotionalHeading,
	description,
	tags,
	heroImageUrl,
	logoUrl,
	// TODO: Add it later
	// closedUntil,
}: StorefrontPreviewProps) {
	const openDays = businessHours ? DAYS.filter((d) => !businessHours[d].closed) : [];
	// const reopenDate = closedUntil ? new Date(closedUntil) : null;

	return (
		<div
			className="flex flex-col rounded-2xl overflow-hidden border border-white/8"
			style={{ background: '#0D1117' }}
			aria-label="Storefront preview"
			role="presentation"
		>
			{/* ── Browser chrome bar ── */}
			<div
				className="flex items-center gap-2 px-4 py-2.5 border-b border-white/8 flex-shrink-0"
				style={{ background: 'rgba(19,25,31,0.9)' }}
			>
				<span className="w-2.5 h-2.5 rounded-full bg-rose-500/60" aria-hidden="true" />
				<span className="w-2.5 h-2.5 rounded-full bg-amber-500/60" aria-hidden="true" />
				<span className="w-2.5 h-2.5 rounded-full bg-green-500/60" aria-hidden="true" />
				<div className="ml-3 flex-1 rounded-full bg-white/5 border border-white/8 px-3 py-1 text-[11px] text-slate-500 truncate">
					nummygo.com/{slug || 'your-restaurant'}
				</div>
			</div>

			{/* ── Scrollable storefront content ── */}
			<div className="overflow-y-auto relative pb-8" style={{ maxHeight: 560 }}>
				{/* Hero Banner Area (Matches HeroBanner.tsx) */}
				<div 
					className="relative min-h-[14rem] bg-[#0D1117] flex items-center justify-center p-5 pt-8 pb-16 overflow-hidden shrink-0 group"
					style={{
						backgroundImage: heroImageUrl ? `url(${heroImageUrl})` : undefined,
						backgroundSize: 'cover',
						backgroundPosition: 'center',
					}}
				>
					{/* Dark overlay mesh ensuring crisp text rendering */}
					{heroImageUrl && <div className="absolute inset-0 bg-[#0D1117]/70 group-hover:bg-[#0D1117]/60 transition-colors z-0" />}

					{/* Banner pattern layer if no image */}
					{!heroImageUrl && (
						<div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
					)}
					<div
						className="absolute inset-0 pointer-events-none opacity-40 z-0"
						style={{ background: 'radial-gradient(circle at 20% 50%, rgba(251,191,36,0.18) 0%, transparent 60%)' }}
						aria-hidden="true"
					/>
                    
                    <div className="relative z-10 w-full flex flex-col gap-2">
                        {promotionalHeading ? (
                            <h2 className="text-3xl font-black text-white leading-[1.05] drop-shadow-md break-words">
                                {promotionalHeading.split(' ').map((word, i, arr) => {
                                    const targetIndex = arr.length > 2 ? Math.floor(arr.length / 2) : 1;
                                    if (i === targetIndex && arr.length > 1) {
                                        return <span key={i}><span className="gradient-text">{word}</span> </span>;
                                    }
                                    return <span key={i}>{word}{i !== arr.length - 1 ? ' ' : ''}</span>;
                                })}
                            </h2>
                        ) : (
                            <h2 className="text-3xl font-black text-white leading-[1.05] drop-shadow-md break-words">
                                Your <span className="gradient-text">Neighbourhood</span><br />Flavours.
                            </h2>
                        )}
                    </div>
				</div>

				{/* Profile Header Block (Overlapping - Matches VendorProfileHeader.tsx) */}
                <div className="relative z-20 mx-4 -mt-10 mb-4 bg-[rgba(19,25,31,0.85)] backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl flex flex-col gap-3">
                    {/* Logo & Status Row */}
                    <div className="flex items-start gap-4">
                        {/* Logo Identity Block */}
                        {logoUrl ? (
                            <div className="relative w-16 h-16 rounded-[10px] overflow-hidden border border-slate-700 shadow-md shrink-0 bg-slate-900">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={logoUrl} alt={`${name || 'Restaurant'} logo`} className="object-cover w-full h-full" />
                            </div>
                        ) : (
                            <div className="flex items-center justify-center w-16 h-16 rounded-[10px] border border-slate-700 bg-slate-900 shadow-md shrink-0">
                                <span className="text-2xl font-black text-slate-600">
                                    {(name || 'Y').charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}

                        <div className="flex flex-col items-start gap-1.5 pt-1">
                            {/* Status Badge */}
                            <div className={`inline-flex self-start items-center gap-1.5 px-2 py-0.5 rounded-full border text-[9px] font-semibold uppercase tracking-wider ${
                                acceptsOrders 
                                    ? 'bg-amber-400/10 border-amber-400/20 text-amber-400' 
                                    : 'bg-red-500/10 border-red-500/20 text-red-500'
                            }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${acceptsOrders ? 'bg-amber-400 animate-pulse' : 'bg-red-500'}`} aria-hidden="true" />
                                {acceptsOrders ? 'Taking Orders' : 'Closed'}
                            </div>

                            <h2 className="text-lg font-black text-slate-100 tracking-tight leading-none mt-0.5 break-words">
                                {name || 'Your Restaurant'}
                            </h2>
                        </div>
                    </div>

                    {/* Texts & Tags */}
                    <div className="flex flex-col gap-2">
                        {description ? (
                            <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">
                                {description}
                            </p>
                        ) : (
                            <p className="text-slate-500 text-xs">
                                Freshly prepared meals crafted with love by local chefs.
                            </p>
                        )}

                        <div className="flex gap-1.5 flex-wrap mt-0.5">
                            {(tags?.length ? tags : ['🍔 Burgers', '🍝 Pasta', '🍣 Sushi']).map((t) => (
                                <span
                                    key={t}
                                    className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-indigo-500/10 border border-indigo-500/20 text-indigo-300"
                                >
                                    {t}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

				{/* Info rows */}
				<div className="px-5 py-4 flex flex-col gap-3 border-b border-white/5">
					<InfoRow icon={<Phone size={12} />} label="Phone">
						<span className="text-slate-300 text-xs">
							{phoneNumber || <span className="text-slate-600 italic">+1 (416) 555-0100</span>}
						</span>
					</InfoRow>

					{email && (
						<InfoRow icon={<Mail size={12} />} label="Email">
							<span className="text-slate-300 text-xs truncate">{email}</span>
						</InfoRow>
					)}

					{address && (
						<InfoRow icon={<MapPin size={12} />} label="Address">
							<a
								href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
								target="_blank"
								rel="noreferrer"
								className="text-amber-400/80 text-xs break-words inline-block leading-relaxed hover:underline"
							>
								{address}
							</a>
						</InfoRow>
					)}

					<InfoRow icon={<LinkIcon size={12} />} label="Your Page">
						<span className="text-amber-400/80 text-xs truncate">
							nummygo.com/{slug || <span className="italic text-slate-600">your-restaurant</span>}
						</span>
					</InfoRow>
				</div>

				{/* Business hours */}
				{openDays.length > 0 && businessHours && (
					<div className="px-5 py-4">
						<InfoRow icon={<Clock size={12} />} label="Hours">
							<dl className="flex flex-col gap-1.5 mt-1">
								{openDays.map((d) => (
									<div key={d} className="flex gap-3 text-xs">
										<dt className="text-slate-500 w-10 flex-shrink-0">{DAY_LABELS[d]}</dt>
										<dd className="text-slate-300">
											{fmt24To12(businessHours[d].open)} – {fmt24To12(businessHours[d].close)}
										</dd>
									</div>
								))}
							</dl>
						</InfoRow>
					</div>
				)}

				{/* Menu placeholder */}
				<div className="px-5 pb-5 mt-1">
					<div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
						<p className="text-[10px] text-slate-600 italic">Menu items will appear here after launch 🍽️</p>
					</div>
				</div>
			</div>
		</div>
	);
}

// ─── Sub-component ────────────────────────────────────────────────────────────
function InfoRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
	return (
		<div className="flex items-start gap-2.5">
			<span
				className="w-7 h-7 rounded-lg flex items-center justify-center bg-amber-400/10 border border-amber-400/20 text-amber-400 flex-shrink-0 mt-0.5"
				aria-hidden="true"
			>
				{icon}
			</span>
			<div className="min-w-0">
				<p className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">{label}</p>
				<div className="mt-0.5">{children}</div>
			</div>
		</div>
	);
}
