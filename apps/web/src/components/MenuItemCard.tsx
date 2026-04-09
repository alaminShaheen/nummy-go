'use client';

import Image from 'next/image';
import { useState, useRef } from 'react';
import { NummyGoBadge, InlineEditableField, BrandSwitch, GradientButton } from '@/components/ui';
import { Minus, Plus, Trash2, UploadCloud, Loader2 } from 'lucide-react';
import { cn } from '@nummygo/shared/ui';

export interface MenuItem {
	id: string;
	name: string;
	description: string;
	price: number;
	image: string;
	badge?: string;
	categoryId?: string | null;
	calories?: number | null;
	isAvailable?: boolean;
}

interface MenuItemCardProps {
	item: MenuItem;
	categoryName?: string;
	mode?: 'customer' | 'builder' | 'draft';
	onAddToCart?: (item: MenuItem, qty: number) => void;
	onDelete?: (id: string) => void;
	onUpdateField?: (id: string, field: string, value: any) => void;
  onDraftSave?: (item: MenuItem) => void;
  onDraftCancel?: () => void;
}

export default function MenuItemCard({ 
  item, 
  categoryName, 
  mode = 'customer', 
  onAddToCart, 
  onDelete,
  onUpdateField,
  onDraftSave,
  onDraftCancel
}: MenuItemCardProps) {
	const [qty, setQty] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Local draft state mirroring
  const [draftState, setDraftState] = useState<MenuItem>(item);

	const handleInitialAdd = () => {
		if (onAddToCart) onAddToCart(item, 1);
		setQty(1);
	};

	const increment = () => {
		if (onAddToCart) onAddToCart(item, 1);
		setQty((q) => q + 1);
	};

	const decrement = () => {
		setQty((q) => Math.max(0, q - 1));
	};

  const handleFieldChange = (field: string, value: any) => {
    if (mode === 'draft') {
      setDraftState(prev => ({ ...prev, [field]: value }));
    } else if (onUpdateField) {
      onUpdateField(item.id, field, value);
    }
  };

  const currentItem = mode === 'draft' ? draftState : item;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    let file: File | null = null;
    if ('dataTransfer' in e) {
      file = e.dataTransfer.files?.[0] || null;
    } else if ('target' in e && (e.target as HTMLInputElement).files) {
      file = (e.target as HTMLInputElement).files?.[0] || null;
    }

    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = document.createElement('img');
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          handleFieldChange('image', dataUrl);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

	return (
		<article
			id={`menu-item-${currentItem.id}`}
			className={cn(
        "relative flex flex-col overflow-visible group bg-[rgba(15,20,29,0.4)] backdrop-blur-2xl shadow-[0_0_40px_rgba(0,0,0,0.3)] transition-all duration-300 rounded-[2rem]",
        mode === 'draft' ? 'border border-amber-500/50 shadow-[0_0_40px_rgba(245,158,11,0.15)] ring-2 ring-amber-500/20' : 'border border-white/5',
        mode === 'builder' && currentItem.isAvailable === false ? 'opacity-70 grayscale-[30%]' : ''
      )}
		>
      {/* Builder Hover Availability Switch & Delete Action */}
      {(mode === 'builder') && (
        <div className="absolute -top-3 right-4 z-50 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-white/10 shadow-xl backdrop-blur-md">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
              {currentItem.isAvailable ? 'Live' : 'Hidden'}
            </span>
            <BrandSwitch 
              checked={currentItem.isAvailable ?? true}
              onChange={(c) => handleFieldChange('isAvailable', c)}
              ariaLabel="Toggle availability"
            />
          </div>
          <button
            onClick={() => onDelete?.(currentItem.id)}
            className="p-2 rounded-full bg-slate-900/90 border border-white/10 text-rose-500 hover:text-white hover:bg-rose-500 hover:border-rose-400 transition-all shadow-xl"
            title="Delete Dish"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}

			{/* Floating Plate Image - Inset deliberately for bento styling */}
			<div className="p-3 pb-0 relative z-10">
				
				<div 
          className={cn(
            "relative w-full aspect-[4/3] rounded-[1.25rem] overflow-hidden shadow-2xl bg-[#0a0d14]",
            (mode === 'builder' || mode === 'draft') && "group/img cursor-pointer"
          )}
          onDragOver={(e) => { 
            if (mode === 'customer') return;
            e.preventDefault(); 
            setIsDragging(true); 
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={mode !== 'customer' ? handleFileUpload : undefined}
          onClick={mode !== 'customer' ? () => fileInputRef.current?.click() : undefined}
        >
					{currentItem.image ? (
            <Image
              src={currentItem.image}
              alt={currentItem.name || 'Dish image'}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 bg-white/[0.02]">
              <UploadCloud size={32} className="mb-2 opacity-50" />
              <p className="text-xs font-semibold uppercase tracking-widest">No Image</p>
            </div>
          )}
					
					{/* Deep cinematic glass fade exclusively on the bottom bounds */}
					<div
						className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none"
						style={{ background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.8) 100%)' }}
						aria-hidden="true"
					/>

					{/* Badge explicitly mounted inside the plate bounds */}
					{currentItem.badge && (
						<span className="absolute top-3 left-3 shadow-[0_0_20px_rgba(0,0,0,0.7)] rounded-full z-20 pointer-events-none">
							<NummyGoBadge label={currentItem.badge} />
						</span>
					)}

					{/* Unavailable indicator inside image for builder mode */}
					{mode === 'builder' && currentItem.isAvailable === false && (
						<span className="absolute top-3 right-3 shadow-[0_0_20px_rgba(0,0,0,0.7)] rounded-full z-20 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white bg-rose-500/80 backdrop-blur-md pointer-events-none">
							Sold Out
						</span>
					)}

          {/* Inline Image Dropzone Overlay */}
          {(mode === 'builder' || mode === 'draft') && (
            <div className={cn(
              "absolute inset-0 bg-amber-500/20 backdrop-blur-sm border-2 border-dashed border-amber-400 flex flex-col items-center justify-center transition-all duration-300 text-white z-30",
              isDragging ? "opacity-100 scale-100" : "opacity-0 scale-[0.98] group-hover/img:opacity-100 group-hover/img:scale-100"
            )}>
              <div className="bg-black/50 p-4 rounded-2xl backdrop-blur-md flex flex-col items-center shadow-2xl border border-white/10 transform transition-transform group-hover/img:-translate-y-2">
                <UploadCloud className="size-8 text-amber-400 mb-2" />
                <span className="font-bold text-sm">Drag image or click</span>
              </div>
              <input 
                ref={fileInputRef} 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileUpload} 
              />
            </div>
          )}
				</div>
			</div>

			{/* Typographic body bounds */}
			<div className="flex flex-col flex-1 p-5 pt-4 gap-4 relative z-20">
				<div className="flex-1 space-y-1">
					{categoryName && (
						<p className="text-[0.65rem] uppercase tracking-widest text-amber-500/80 mb-1 font-semibold">{categoryName}</p>
					)}
          
          {mode === 'customer' ? (
            <>
              <h3 className="font-bold text-slate-100 text-[1.05rem] leading-tight tracking-tight">{currentItem.name}</h3>
					    <p className="text-slate-400 text-sm mt-1.5 leading-relaxed line-clamp-2">{currentItem.description}</p>
            </>
          ) : (
            <>
              <InlineEditableField 
                type="text"
                value={currentItem.name}
                onSave={(val) => handleFieldChange('name', val)}
                placeholder="Dish Name..."
                textClassName="font-bold text-slate-100 text-[1.05rem] leading-tight tracking-tight"
              />
              <InlineEditableField 
                type="textarea"
                value={currentItem.description}
                onSave={(val) => handleFieldChange('description', val)}
                placeholder="Description..."
                textClassName="text-slate-400 text-sm mt-1.5 leading-relaxed line-clamp-2"
              />
            </>
          )}
					
					{mode === 'customer' && currentItem.calories && (
						<p className="text-slate-500/80 text-[0.7rem] font-medium tracking-wide mt-2">
							{currentItem.calories} cal
						</p>
					)}

          {(mode === 'builder' || mode === 'draft') && (
            <InlineEditableField 
              type="number"
              value={currentItem.calories ?? ''}
              onSave={(val) => handleFieldChange('calories', val ? parseInt(val, 10) : null)}
              placeholder="Calories"
              suffix="cal"
              textClassName="text-slate-500/80 text-[0.7rem] font-medium tracking-wide mt-2"
            />
          )}

          <div className="pt-2">
            {mode === 'customer' ? (
              <span className="text-amber-400 tracking-wide font-semibold">${currentItem.price.toFixed(2)}</span>
            ) : (
              <InlineEditableField 
                type="number"
                value={currentItem.price}
                onSave={(val) => handleFieldChange('price', parseFloat(val))}
                placeholder="Price"
                prefix="$"
                textClassName="text-amber-400 tracking-wide font-semibold text-base"
              />
            )}
          </div>
				</div>

        {/* Draft Mode Save Action */}
        {mode === 'draft' && (
          <div className="pt-4 flex gap-2 w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
            <button 
              onClick={() => onDraftCancel?.()}
              className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <GradientButton 
              onClick={() => onDraftSave?.(currentItem)}
              className="flex-[2] py-2 h-auto text-xs font-bold"
            >
              🚀 Save Dish
            </GradientButton>
          </div>
        )}

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
								<span className="text-amber-400 tracking-wide">${currentItem.price.toFixed(2)}</span>
							</button>
						)}
					</div>
				)}
			</div>
		</article>
	);
}
