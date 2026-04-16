'use client';

import { clsx } from 'clsx';
import { useTheme } from '@/lib/themes';

interface BrandSwitchProps {
	checked: boolean;
	onChange: (checked: boolean) => void;
	ariaLabel: string;
	variant?: 'amber' | 'green';
}

export function BrandSwitch({ checked, onChange, ariaLabel, variant = 'amber' }: BrandSwitchProps) {
	const { theme } = useTheme();
	const isLight = theme.name === 'light';

	return (
		<button
			type="button"
			onClick={() => onChange(!checked)}
			aria-label={ariaLabel}
			className={clsx(
				'relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 border',
				{
					'bg-amber-500 border-amber-400': checked && variant === 'amber',
					'bg-green-500 border-green-400': checked && variant === 'green',
				}
			)}
			style={!checked ? { background: theme.bg, borderColor: theme.card.border } : {}}
		>
			<span
				className={clsx(
					'absolute top-[1px] w-[20px] h-[20px] rounded-full shadow transition-transform duration-200',
					{
						'left-[1px]': !checked,
						'bg-slate-400': !checked && isLight,
						'bg-slate-500': !checked && !isLight,
						'left-[21px] bg-black': checked && variant === 'amber',
						'left-[21px] bg-white': checked && variant === 'green',
					}
				)}
			/>
		</button>
	);
}
