'use client';

/**
 * apps/web/src/components/SocialLinksRow.tsx
 *
 * Renders a horizontal row of social media icons with links.
 * Uses the nummyGo theme palette (slate/amber) for a cohesive look.
 * Used in both the StorefrontPreview and VendorProfileHeader components.
 */

import type { SocialLinks } from '@nummygo/shared/models/types';

interface SocialLinksRowProps {
	links: SocialLinks;
	/** Sizing variant: 'sm' for preview panel, 'md' for live storefront */
	size?: 'sm' | 'md';
}

const PLATFORMS = [
	{ key: 'instagram' as const, label: 'Instagram' },
	{ key: 'facebook' as const, label: 'Facebook' },
	{ key: 'twitter' as const, label: 'X' },
	{ key: 'tiktok' as const, label: 'TikTok' },
	{ key: 'website' as const, label: 'Website' },
] as const;

export default function SocialLinksRow({ links, size = 'sm' }: SocialLinksRowProps) {
	const activeLinks = PLATFORMS.filter((p) => {
		const val = links[p.key];
		return val && val.trim() !== '';
	});

	if (activeLinks.length === 0) return null;

	const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
	const btnSize = size === 'sm'
		? 'w-7 h-7 rounded-lg'
		: 'w-9 h-9 rounded-xl';

	return (
		<div className="flex items-center gap-1.5 mt-1">
			{activeLinks.map((p) => (
				<a
					key={p.key}
					href={links[p.key]!}
					target="_blank"
					rel="noopener noreferrer"
					title={p.label}
					className={`${btnSize} group flex items-center justify-center bg-white/[0.04] border border-white/8 hover:border-amber-400/30 hover:bg-amber-400/10 transition-all duration-200`}
				>
					<PlatformIcon platform={p.key} className={`${iconSize} text-slate-500 group-hover:text-amber-400 transition-colors duration-200`} />
				</a>
			))}
		</div>
	);
}

// ─── Platform SVG Icons (monochrome — inherits currentColor) ──────────────────
function PlatformIcon({ platform, className }: { platform: string; className: string }) {
	switch (platform) {
		case 'instagram':
			return (
				<svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
					<rect x="2" y="2" width="20" height="20" rx="5" />
					<circle cx="12" cy="12" r="5" />
					<circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
				</svg>
			);
		case 'facebook':
			return (
				<svg viewBox="0 0 24 24" className={className} fill="currentColor">
					<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
				</svg>
			);
		case 'twitter':
			return (
				<svg viewBox="0 0 24 24" className={className} fill="currentColor">
					<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
				</svg>
			);
		case 'tiktok':
			return (
				<svg viewBox="0 0 24 24" className={className} fill="currentColor">
					<path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.11V9.01A6.29 6.29 0 004 15.28a6.29 6.29 0 006.28 6.28 6.29 6.29 0 006.28-6.28V9.33a8.24 8.24 0 004.84 1.56V7.44a4.85 4.85 0 01-1.81-.75z" />
				</svg>
			);
		case 'website':
			return (
				<svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
					<circle cx="12" cy="12" r="10" />
					<path d="M2 12h20" />
					<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
				</svg>
			);
		default:
			return null;
	}
}
