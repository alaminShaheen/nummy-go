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
import type { BusinessHours, SocialLinks } from '@nummygo/shared/models/types';
import { DAY_LABELS, DAYS } from '@/constants/tenant';
import { fmt24To12 } from '@/utils/tenant';
import SocialLinksRow from '@/components/SocialLinksRow';
import { useTheme } from '@/lib/themes';

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
	socialLinks?: SocialLinks | null;
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
	socialLinks,
	// TODO: Add it later
	// closedUntil,
}: StorefrontPreviewProps) {
	const openDays = businessHours ? DAYS.filter((d) => !businessHours[d].closed) : [];
	// const reopenDate = closedUntil ? new Date(closedUntil) : null;
	const { theme } = useTheme();
	const isLight = theme.name === 'light';

	return (
		<div
			className="flex flex-col rounded-2xl overflow-hidden border"
			style={{ background: theme.bg, borderColor: theme.card.border }}
			aria-label="Storefront preview"
			role="presentation"
		>
			{/* ── Browser chrome bar ── */}
			<div
				className="flex items-center gap-2 px-4 py-2.5 border-b flex-shrink-0"
				style={{ background: isLight ? theme.surface : 'rgba(19,25,31,0.9)', borderColor: theme.card.border }}
			>
				<span className="w-2.5 h-2.5 rounded-full bg-rose-500/60" aria-hidden="true" />
				<span className="w-2.5 h-2.5 rounded-full bg-amber-500/60" aria-hidden="true" />
				<span className="w-2.5 h-2.5 rounded-full bg-green-500/60" aria-hidden="true" />
				<div 
					className="ml-3 flex-1 rounded-full border px-3 py-1 text-[11px] truncate flex items-center"
					style={{ 
						background: isLight ? theme.bg : 'rgba(255,255,255,0.05)', 
						borderColor: theme.card.border, 
						color: theme.text.muted 
					}}
				>
					nummygo.com/{slug || 'your-restaurant'}
				</div>
			</div>

			{/* ── Scrollable storefront content ── */}
			<div className="overflow-y-auto relative pb-8" style={{ maxHeight: 560 }}>
				{/* Hero Banner Area (Matches HeroBanner.tsx) */}
				<div 
					className="relative min-h-[14rem] flex items-center justify-center p-5 pt-8 pb-16 overflow-hidden shrink-0 group"
					style={{
						backgroundImage: heroImageUrl ? `url(${heroImageUrl})` : undefined,
						backgroundSize: 'cover',
						backgroundPosition: 'center',
						backgroundColor: isLight ? '#cbd5e1' : '#0D1117',
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
                <div 
					className="relative z-20 mx-4 -mt-10 mb-4 backdrop-blur-xl border rounded-2xl p-4 shadow-2xl flex flex-col gap-3"
					style={{ 
						background: isLight ? 'rgba(255,255,255,0.85)' : 'rgba(19,25,31,0.85)', 
						borderColor: theme.card.border 
					}}
				>
                    {/* Logo & Status Row */}
                    <div className="flex items-start gap-4">
                        {/* Logo Identity Block */}
                        {logoUrl ? (
                            <div className="relative w-16 h-16 rounded-[10px] overflow-hidden border shadow-md shrink-0" style={{ borderColor: theme.card.border, background: theme.bg }}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={logoUrl} alt={`${name || 'Restaurant'} logo`} className="object-cover w-full h-full" />
                            </div>
                        ) : (
                            <div className="flex items-center justify-center w-16 h-16 rounded-[10px] border shadow-md shrink-0" style={{ borderColor: theme.card.border, background: theme.bg }}>
                                <span className="text-2xl font-black" style={{ color: theme.text.muted }}>
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

                            <h2 className="text-lg font-black tracking-tight leading-none mt-0.5 break-words" style={{ color: theme.text.primary }}>
                                {name || 'Your Restaurant'}
                            </h2>
                        </div>
                    </div>

                    {/* Texts & Tags */}
                    <div className="flex flex-col gap-2">
                        {description ? (
                            <p className="text-xs leading-relaxed line-clamp-3" style={{ color: theme.text.secondary }}>
                                {description}
                            </p>
                        ) : (
                            <p className="text-xs" style={{ color: theme.text.muted }}>
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

                        {/* Social Links — after tags */}
                        {socialLinks && <SocialLinksRow links={socialLinks} size="sm" />}
                    </div>
                </div>

				{/* Info rows */}
				<div className="px-5 py-4 flex flex-col gap-3 border-b" style={{ borderColor: theme.card.border }}>
					<InfoRow icon={<Phone size={12} />} label="Phone">
						<span className="text-xs" style={{ color: theme.text.secondary }}>
							{phoneNumber || <span className="italic" style={{ color: theme.text.muted }}>+1 (416) 555-0100</span>}
						</span>
					</InfoRow>

					{email && (
						<InfoRow icon={<Mail size={12} />} label="Email">
							<span className="text-xs truncate" style={{ color: theme.text.secondary }}>{email}</span>
						</InfoRow>
					)}

					{address && (
						<InfoRow icon={<MapPin size={12} />} label="Address">
							<a
								href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
								target="_blank"
								rel="noreferrer"
								className="text-amber-400/80 text-xs break-words inline-block leading-relaxed hover:underline"
								style={{ color: isLight ? '#ea580c' : undefined }}
							>
								{address}
							</a>
						</InfoRow>
					)}

					<InfoRow icon={<LinkIcon size={12} />} label="Your Page">
						<span className="text-amber-400/80 text-xs truncate" style={{ color: isLight ? '#ea580c' : undefined }}>
							nummygo.com/{slug || <span className="italic" style={{ color: theme.text.muted }}>your-restaurant</span>}
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
										<dt className="w-10 flex-shrink-0" style={{ color: theme.text.muted }}>{DAY_LABELS[d]}</dt>
										<dd style={{ color: theme.text.secondary }}>
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
					<div className="p-3 rounded-xl border text-center" style={{ background: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)', borderColor: theme.card.border }}>
						<p className="text-[10px] italic" style={{ color: theme.text.muted }}>Menu items will appear here after launch 🍽️</p>
					</div>
				</div>
			</div>
		</div>
	);
}

// ─── Sub-component ────────────────────────────────────────────────────────────
function InfoRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
	const { theme } = useTheme();
	const isLight = theme.name === 'light';

	return (
		<div className="flex items-start gap-2.5">
			<span
				className="w-7 h-7 rounded-lg flex items-center justify-center border flex-shrink-0 mt-0.5"
				style={{ 
					background: isLight ? 'rgba(234,88,12,0.1)' : 'rgba(245,158,11,0.1)', 
					borderColor: isLight ? 'rgba(234,88,12,0.2)' : 'rgba(245,158,11,0.2)',
					color: isLight ? '#ea580c' : '#fbbf24'
				}}
				aria-hidden="true"
			>
				{icon}
			</span>
			<div className="min-w-0">
				<p className="text-[10px] uppercase tracking-widest font-medium" style={{ color: theme.text.muted }}>{label}</p>
				<div className="mt-0.5">{children}</div>
			</div>
		</div>
	);
}
