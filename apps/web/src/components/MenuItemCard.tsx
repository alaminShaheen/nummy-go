'use client';

import Image from 'next/image';
import { useState } from 'react';
import { NummyGoBadge } from '@/components/ui';
import { Minus, Plus, Edit2, Trash2 } from 'lucide-react';

export interface MenuItem {
	id: string;
	name: string;
	description: string;
	price: number;
	image: string;
	badge?: string; // e.g. "Popular", "New", "Chef's Pick"
	categoryId?: string | null;
	calories?: number | null;
	isAvailable?: boolean;
}

interface MenuItemCardProps {
	item: MenuItem;
	categoryName?: string;
	mode?: 'customer' | 'builder';
	onAddToCart?: (item: MenuItem, qty: number) => void;
	onEdit?: (item: MenuItem) => void;
	onDelete?: (id: string) => void;
}

export default function MenuItemCard({ item, categoryName, mode = 'customer', onAddToCart, onEdit, onDelete }: MenuItemCardProps) {
	const [qty, setQty] = useState(0);

	const handleInitialAdd = () => {
		if (onAddToCart) onAddToCart(item, 1);
		setQty(1);
	};

	const increment = () => {
		if (onAddToCart) onAddToCart(item, 1);
		setQty((q) => q + 1);
	};

	const decrement = () => {
		// Decrease local count (doesn't instantly destruct cart globally for UX speed)
		setQty((q) => Math.max(0, q - 1));
	};

	return (
		<article
			id={`menu-item-${item.id}`}
			className={`relative flex flex-col overflow-hidden group bg-[rgba(15,20,29,0.4)] backdrop-blur-2xl border border-white/5 shadow-[0_0_40px_rgba(0,0,0,0.3)] transition-all duration-300 rounded-[2rem] 
				${mode === 'builder' && item.isAvailable === false ? 'opacity-60 grayscale-[50%]' : ''}`}
		>
			{/* Floating Plate Image - Inset deliberately for bento styling */}
			<div className="p-3 pb-0 relative">
				{mode === 'builder' && (
					<div className="absolute inset-x-3 top-3 bottom-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity z-30 flex items-center justify-center gap-4 backdrop-blur-sm rounded-[1.25rem]">
						<button
							onClick={() => onEdit?.(item)}
							className="p-3 rounded-full bg-amber-500 text-black hover:bg-amber-400 transition-transform hover:scale-110 shadow-lg"
							aria-label="Edit Item"
						>
							<Edit2 className="size-5" />
						</button>
						<button
							onClick={() => onDelete?.(item.id)}
							className="p-3 rounded-full bg-rose-500 text-white hover:bg-rose-400 transition-transform hover:scale-110 shadow-lg"
							aria-label="Delete Item"
						>
							<Trash2 className="size-5" />
						</button>
					</div>
				)}
				
				<div className="relative w-full aspect-[4/3] rounded-[1.25rem] overflow-hidden shadow-2xl bg-[#0a0d14]">
					<Image
						src={item.image}
						alt={item.name}
						fill
						className="object-cover transition-transform duration-700 group-hover:scale-110"
						sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
					/>
					
					{/* Deep cinematic glass fade exclusively on the bottom bounds */}
					<div
						className="absolute inset-x-0 bottom-0 h-1/2"
						style={{
							background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.8) 100%)',
						}}
						aria-hidden="true"
					/>

					{/* Badge explicitly mounted inside the plate bounds */}
					{item.badge && (
						<span className="absolute top-3 left-3 shadow-[0_0_20px_rgba(0,0,0,0.7)] rounded-full z-20">
							<NummyGoBadge label={item.badge} />
						</span>
					)}

					{/* Unavailable indicator inside image for builder mode */}
					{mode === 'builder' && item.isAvailable === false && (
						<span className="absolute top-3 right-3 shadow-[0_0_20px_rgba(0,0,0,0.7)] rounded-full z-20 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white bg-rose-500/80 backdrop-blur-md">
							Sold Out
						</span>
					)}
				</div>
			</div>

			{/* Typographic body bounds */}
			<div className="flex flex-col flex-1 p-5 pt-4 gap-4">
				{/* Header */}
				<div className="flex-1">
					{categoryName && (
						<p className="text-[0.65rem] uppercase tracking-widest text-amber-500/80 mb-1 font-semibold">{categoryName}</p>
					)}
					<h3 className="font-bold text-slate-100 text-[1.05rem] leading-tight tracking-tight">{item.name}</h3>
					<p className="text-slate-400 text-sm mt-1.5 leading-relaxed line-clamp-2">{item.description}</p>
					
					{item.calories && (
						<p className="text-slate-500/80 text-[0.7rem] font-medium tracking-wide mt-2">
							{item.calories} cal
						</p>
					)}
				</div>

				{/* Purely Morphing CTA Button Zone (Customer Mode Only) */}
				{mode === 'customer' && (
					<div className="mt-1 h-12 flex items-center justify-center w-full relative">
						{qty > 0 ? (
							<div className="w-full h-full flex items-center justify-between px-1.5 rounded-[1.5rem] border border-amber-500/40 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.15)] animate-in fade-in zoom-in duration-200">
								<button 
									onClick={decrement}
									className="w-9 h-9 rounded-full flex items-center justify-center text-amber-500 hover:bg-amber-500/20 hover:text-amber-400 transition-colors"
									aria-label="Decrease quantity"
								>
									<Minus size={18} strokeWidth={2.5} />
								</button>
								<span className="font-bold text-xs uppercase tracking-widest text-amber-400 tabular-nums select-none">
									<span className="text-white text-sm font-black mr-1">{qty}</span> Added
								</span>
								<button 
									onClick={increment}
									className="w-9 h-9 rounded-full flex items-center justify-center text-amber-500 hover:bg-amber-500/20 hover:text-amber-400 transition-colors"
									aria-label="Increase quantity"
								>
									<Plus size={18} strokeWidth={2.5} />
								</button>
							</div>
						) : (
							<button 
								onClick={handleInitialAdd}
								className="w-full h-full flex items-center justify-center gap-2.5 rounded-[1.5rem] border border-white/5 bg-white-[0.02] hover:bg-amber-500/20 hover:border-amber-500/40 hover:text-amber-400 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] text-slate-300 text-sm font-semibold transition-all duration-300 group/btn"
							>
								<span className="group-hover/btn:text-amber-400 transition-colors">Add to Cart</span>
								<span className="w-1 h-1 rounded-full bg-slate-600 group-hover/btn:bg-amber-600 transition-colors" aria-hidden="true" />
								<span className="text-amber-400 tracking-wide">${item.price.toFixed(2)}</span>
							</button>
						)}
					</div>
				)}
			</div>
		</article>
	);
}
