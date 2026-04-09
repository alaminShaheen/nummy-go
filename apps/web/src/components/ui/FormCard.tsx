'use client';

import { ReactNode } from 'react';
import { clsx } from 'clsx';

interface FormCardProps {
	icon: ReactNode;
	title: string;
	children: ReactNode;
	className?: string;
}

export function FormCard({ icon, title, children, className }: FormCardProps) {
	return (
		<section
			className={clsx("rounded-2xl p-6 flex flex-col gap-5 border border-white/8 relative", className)}
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
