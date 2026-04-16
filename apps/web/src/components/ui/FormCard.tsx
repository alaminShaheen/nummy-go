'use client';

import { ReactNode } from 'react';
import { clsx } from 'clsx';
import { useTheme } from '@/lib/themes';

interface FormCardProps {
	icon: ReactNode;
	title: string;
	children: ReactNode;
	className?: string;
}

export function FormCard({ icon, title, children, className }: FormCardProps) {
	const { theme } = useTheme();
	const isLight = theme.name === 'light';

	return (
		<section
			className={clsx("rounded-2xl p-6 flex flex-col gap-5 relative", className)}
			style={{ 
				background: isLight ? theme.bg : 'rgba(19,25,31,0.85)', 
				backdropFilter: 'blur(16px)',
				border: `1px solid ${theme.card.border}`,
				boxShadow: isLight ? '0 4px 20px rgba(15,23,42,0.05)' : 'none'
			}}
		>
			<div className="flex items-center gap-2.5 mb-1">
				<span className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center flex-shrink-0">
					{icon}
				</span>
				<h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: theme.text.primary }}>{title}</h2>
			</div>
			{children}
		</section>
	);
}
