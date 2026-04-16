import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../lib/utils';

const buttonVariants = cva(
	'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 focus-visible:outline-none disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0',
	{
		variants: {
			variant: {
				default:
					'rounded-md ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50',
				destructive:
					'rounded-md ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50',
				outline:
					'rounded-md ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50',
				secondary:
					'rounded-md ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50',
				ghost:
					'rounded-md ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:bg-accent hover:text-accent-foreground disabled:opacity-50',
				link: 'rounded-md text-primary underline-offset-4 hover:underline disabled:opacity-50',

				/* ── nummyGo brand variants ────────────────────────────── */
				gradient:
					'rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold shadow-lg shadow-orange-900/40 hover:shadow-xl hover:shadow-orange-900/60 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100',
				glass:
					'rounded-full font-semibold border border-white/10 text-slate-300 hover:border-amber-400/30 hover:text-amber-400 disabled:opacity-50 disabled:cursor-not-allowed',
				'destructive-outline':
					'rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-500 disabled:opacity-50',
			},
			size: {
				default: 'h-10 px-4 py-2',
				sm: 'h-9 rounded-md px-3',
				lg: 'h-11 rounded-md px-8',
				icon: 'h-10 w-10',
				pill: 'px-5 py-2.5 text-xs',
				cta: 'h-12 w-full px-7 py-3.5',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	}
);

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
	asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, asChild = false, ...props }, ref) => {
		const Comp = asChild ? Slot : 'button';
		return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
	}
);
Button.displayName = 'Button';

export { Button, buttonVariants };
