'use client';

import Image from 'next/image';
import { useState, useRef } from 'react';
import { NummyGoBadge, InlineEditableField, BrandSwitch, GradientButton } from '@/components/ui';
import { getBadgeStyle } from '@/components/ui/NummyGoBadge';
import { Minus, Plus, Trash2, UploadCloud, Loader2, Check, X } from 'lucide-react';
import { cn } from '@nummygo/shared/ui';

export interface MenuItem {
	id: string;
	name: string;
	description: string;
	price: number;
	image: string;
	badge?: string | null;
	categoryId?: string | null;
	calories?: number | null;
	isAvailable?: boolean;
}

interface MenuItemCardProps {
	item: MenuItem;
	categoryName?: string;
  categories?: { id: string; name: string }[];
	mode?: 'customer' | 'builder' | 'draft';
	onAddToCart?: (item: MenuItem, qty: number) => void; // Deprecated, kept for backward comp
  onUpdateQuantity?: (item: MenuItem, qty: number) => void;
  cartQty?: number;
	onDelete?: (id: string) => Promise<void> | void;
	onUpdateField?: (id: string, field: string, value: any) => void;
  onDraftSave?: (item: MenuItem) => Promise<void> | void;
  onDraftCancel?: () => void;
  isClosed?: boolean;
}

export default function MenuItemCard({ 
  item, 
  categoryName, 
  categories,
  mode = 'customer', 
  cartQty = 0,
  onAddToCart,
  onUpdateQuantity,
  onDelete,
  onUpdateField,
  onDraftSave,
  onDraftCancel,
  isClosed = false
}: MenuItemCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Local state modeling
  const [draftState, setDraftState] = useState<MenuItem>(item);
  const [draftStatus, setDraftStatus] = useState<'idle' | 'saving' | 'success'>('idle');
  const [deleteStatus, setDeleteStatus] = useState<'idle' | 'confirming' | 'deleting'>('idle');
  const [validationError, setValidationError] = useState<string | null>(null);

	const handleInitialAdd = () => {
    if (onUpdateQuantity) onUpdateQuantity(item, 1);
		else if (onAddToCart) onAddToCart(item, 1);
	};

	const increment = () => {
    if (onUpdateQuantity) onUpdateQuantity(item, cartQty + 1);
		else if (onAddToCart) onAddToCart(item, 1);
	};

	const decrement = () => {
		if (onUpdateQuantity) onUpdateQuantity(item, Math.max(0, cartQty - 1));
	};

  const handleFieldChange = (field: string, value: any) => {
    if (mode === 'draft') {
      setDraftState(prev => ({ ...prev, [field]: value }));
    } else if (onUpdateField) {
      onUpdateField(item.id, field, value);
    }
  };

  const currentItem = mode === 'draft' ? draftState : item;

  const handleConfirmDelete = async () => {
    if (!onDelete) return;
    setDeleteStatus('deleting');
    try {
      await onDelete(currentItem.id);
      // No need to reset state, the component will smoothly unmount from DOM when TRPC invalidates.
    } catch (err) {
      setDeleteStatus('confirming');
      // Toast error is handled centrally
    }
  };

  const handleDraftSaveClick = async () => {
    if (!onDraftSave) return;
    
    // Inline Validation
    if (!currentItem.name?.trim() || !currentItem.price) {
      setValidationError("Name & Price are required");
      setTimeout(() => setValidationError(null), 3500);
      return;
    }

    setDraftStatus('saving');
    try {
      await onDraftSave(currentItem);
      setDraftStatus('success');
      setValidationError(null);
      setTimeout(() => {
        onDraftCancel?.();
      }, 1500);
    } catch (err) {
      setDraftStatus('idle');
      // error is handled explicitly by the caller (Alerting)
    }
  };

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
        "relative flex flex-col overflow-visible group bg-[rgba(15,20,29,0.4)] backdrop-blur-2xl transition-all duration-500 rounded-[2rem]",
        mode === 'draft' ? 'border border-amber-500/50 shadow-[0_0_40px_rgba(245,158,11,0.15)] ring-2 ring-amber-500/20' : 'border border-white/5 shadow-[0_0_40px_rgba(0,0,0,0.3)] hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(245,158,11,0.12)] hover:border-white/10',
        currentItem.isAvailable === false ? 'opacity-70 grayscale-[30%]' : ''
      )}
		>
      {/* Background layer to trap overflow for image radius without cutting off absolute badges */}
      <div className="absolute inset-0 rounded-[2rem] overflow-hidden pointer-events-none -z-10"></div>

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
					{(currentItem.badge || mode !== 'customer') && (
						<div className="absolute top-3 left-3 z-40">
              {mode === 'customer' ? (
                <span className="shadow-[0_0_20px_rgba(0,0,0,0.7)] rounded-full pointer-events-none block">
                  <NummyGoBadge label={currentItem.badge!} />
                </span>
              ) : (
                <div className={cn("rounded-full shadow-[0_0_20px_rgba(0,0,0,0.7)] transition-all flex items-center relative overflow-hidden group/badge border border-transparent", getBadgeStyle(currentItem.badge))}>
                  <InlineEditableField
                    type="text"
                    value={currentItem.badge || ''}
                    onSave={(val) => handleFieldChange('badge', val || null)}
                    placeholder="+ Add Badge"
                    textClassName="text-[10px] uppercase font-black tracking-widest px-2.5 py-1 whitespace-nowrap outline-none flex-1 text-current brightness-150"
                    inputClassName="text-[10px] uppercase font-black tracking-widest bg-transparent border-none px-2.5 py-1 w-24 outline-none placeholder-current caret-current !text-current brightness-150"
                  />
                  {currentItem.badge && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleFieldChange('badge', null); }} 
                      className="opacity-60 hover:opacity-100 mr-2.5 ml-0 cursor-pointer pointer-events-auto shrink-0 transition-opacity text-current brightness-150"
                      title="Clear badge"
                    >
                      <X size={12} strokeWidth={3} />
                    </button>
                  )}
                </div>
              )}
						</div>
					)}

					{/* Unavailable indicator inside image */}
					{currentItem.isAvailable === false && (
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
          <div className="flex items-center justify-between mb-1 gap-2">
            <div>
              {mode === 'customer' ? (
                categoryName && (
                  <p className="text-[0.65rem] uppercase tracking-widest text-amber-500/80 font-semibold">{categoryName}</p>
                )
              ) : (
                <div className="-ml-1">
                  <select 
                    value={currentItem.categoryId || 'uncategorized'}
                    onChange={(e) => handleFieldChange('categoryId', e.target.value === 'uncategorized' ? null : e.target.value)}
                    className="text-[0.65rem] uppercase tracking-[0.1em] text-amber-500/80 font-semibold bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20 px-2 py-1 outline-none cursor-pointer rounded-full transition-colors appearance-none"
                  >
                    <option value="uncategorized" className="bg-slate-900 text-slate-400">❖ UNCATEGORIZED</option>
                    {categories?.map(c => (
                      <option key={c.id} value={c.id} className="bg-slate-900 text-slate-200">
                        {c.name.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="shrink-0 flex items-center justify-end">
              {mode === 'customer' ? (
                currentItem.calories && (
                  <p className="text-slate-500/70 text-[0.65rem] font-black uppercase tracking-widest">
                    {currentItem.calories} cal
                  </p>
                )
              ) : (
                <InlineEditableField 
                  type="number"
                  value={currentItem.calories ?? ''}
                  onSave={(val) => handleFieldChange('calories', val ? parseInt(val, 10) : null)}
                  placeholder="0"
                  suffix="cal"
                  textClassName="text-slate-500/70 text-[0.65rem] font-black uppercase tracking-widest text-right"
                  inputClassName="text-right w-16 !text-[0.65rem]"
                />
              )}
            </div>
          </div>
          
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
          <div className="pt-2 flex flex-col gap-2 w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
            {validationError && (
              <div className="flex items-center gap-1.5 text-rose-500 text-[10px] font-bold uppercase tracking-widest bg-rose-500/10 px-3 py-1.5 rounded-full w-max mx-auto shadow-[0_0_10px_rgba(244,63,94,0.2)]">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                {validationError}
              </div>
            )}
            <div className="flex gap-2 w-full mt-1">
              <button 
                onClick={() => onDraftCancel?.()}
                disabled={draftStatus !== 'idle'}
                className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <GradientButton 
                onClick={handleDraftSaveClick}
                disabled={draftStatus !== 'idle'}
                className="flex-[2] py-2 h-auto text-xs font-bold disabled:opacity-80 transition-all"
              >
                {draftStatus === 'saving' ? (
                  <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Saving...</span>
                ) : '🚀 Save Dish'}
              </GradientButton>
            </div>
          </div>
        )}

				{/* Purely Morphing CTA Button Zone (Customer Mode Only) */}
				{mode === 'customer' && (
					<div className="mt-1 h-12 flex items-center justify-center w-full relative">
						{isClosed ? (
							<div className="w-full h-full flex items-center justify-center rounded-[1.5rem] border border-white/5 bg-white/[0.02] text-slate-500 text-[0.7rem] font-bold uppercase tracking-widest pointer-events-none select-none shadow-inner">
								Store Closed
							</div>
						) : currentItem.isAvailable === false ? (
              <div className="w-full h-full flex items-center justify-center rounded-[1.5rem] border border-rose-500/20 bg-rose-500/5 text-rose-500/60 text-[0.7rem] font-bold uppercase tracking-widest pointer-events-none select-none shadow-inner">
								Sold Out
							</div>
            ) : cartQty > 0 ? (
							<div className="w-full h-full flex items-center justify-between px-1.5 rounded-[1.5rem] border border-amber-500/40 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.15)] animate-in fade-in zoom-in duration-200">
								<button 
									onClick={decrement}
									className="w-9 h-9 rounded-full flex items-center justify-center text-amber-500 hover:bg-amber-500/20 hover:text-amber-400 transition-colors"
									aria-label="Decrease quantity"
								>
									<Minus size={18} strokeWidth={2.5} />
								</button>
								<span className="font-bold text-xs uppercase tracking-widest text-amber-400 tabular-nums select-none">
									<span className="text-white text-sm font-black mr-1">{cartQty}</span> Added
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
								className="w-full h-full flex items-center justify-center gap-2.5 rounded-[1.5rem] border border-white/5 bg-white/[0.02] hover:bg-amber-500/20 hover:border-amber-500/40 hover:text-amber-400 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] text-slate-300 text-sm font-semibold transition-all duration-300 group/btn"
							>
								<span className="group-hover/btn:text-amber-400 transition-colors">Add to Cart</span>
								<span className="w-1 h-1 rounded-full bg-slate-600 group-hover/btn:bg-amber-600 transition-colors" aria-hidden="true" />
								<span className="text-amber-400 tracking-wide">${currentItem.price.toFixed(2)}</span>
							</button>
						)}
					</div>
				)}

				{/* Builder Mode Persistent Action Toolbar */}
				{mode === 'builder' && (
					<div className="mt-2 pt-4 border-t border-white/5 flex items-center justify-between w-full">
            <div className="flex items-center gap-3 bg-[rgba(0,0,0,0.2)] rounded-full px-1.5 py-1 pr-3 border border-white/5 shadow-inner backdrop-blur-md">
               <BrandSwitch 
                 checked={currentItem.isAvailable ?? true}
                 onChange={(val) => handleFieldChange('isAvailable', val)}
                 ariaLabel="Toggle availability"
               />
               <span className={cn(
                 "text-[10px] font-black uppercase tracking-widest transition-colors w-12 text-center",
                 (currentItem.isAvailable ?? true) ? "text-emerald-400" : "text-slate-500"
               )}>
                 {(currentItem.isAvailable ?? true) ? "Active" : "Hidden"}
               </span>
            </div>

						<button 
							onClick={() => setDeleteStatus('confirming')}
							className="relative flex items-center justify-center h-8 px-3 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500 hover:text-rose-950 hover:shadow-[0_0_15px_rgba(244,63,94,0.4)] transition-all duration-300 group/btn gap-1.5"
						>
							<Trash2 size={14} strokeWidth={2.5} />
              <span className="text-[10px] font-black uppercase tracking-widest">Drop</span>
						</button>
					</div>
				)}
			</div>

      {/* Option 2: Inline Canvas Morph Success State */}
      {mode === 'draft' && (
        <div className={cn(
          "absolute inset-0 bg-emerald-500/15 backdrop-blur-xl border-2 border-emerald-500/50 flex flex-col items-center justify-center pointer-events-none transition-all duration-500 z-50 rounded-[2rem]",
          draftStatus === 'success' ? "opacity-100 scale-100" : "opacity-0 scale-[0.8]"
        )}>
            <div className={cn(
              "w-20 h-20 rounded-full bg-emerald-500 text-black flex items-center justify-center font-bold mb-6 shadow-[0_0_40px_rgba(16,185,129,0.4)]",
              draftStatus === 'success' && "animate-bounce"
            )}>
                <Check size={40} strokeWidth={3} />
            </div>
            <span className="text-white font-black tracking-widest uppercase text-sm">Dish Created!</span>
            {categoryName && (
              <p className="text-emerald-400/80 text-[10px] mt-2 font-bold uppercase tracking-[0.2em]">Added to {categoryName}</p>
            )}
        </div>
      )}

      {/* Danger Deletion State Override (Inline Glassmorphic Lock) */}
      {deleteStatus !== 'idle' && (
        <div className="absolute inset-0 bg-[#300810]/70 backdrop-blur-xl border border-rose-500/30 z-[60] rounded-[2rem] flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95 duration-300">
          <Trash2 size={36} className={cn("text-rose-500 mb-3 drop-shadow-[0_0_15px_rgba(244,63,94,0.4)]", deleteStatus === 'deleting' && "animate-bounce")} />
          <h4 className="text-white font-bold text-lg leading-none mb-1">Erase this dish?</h4>
          <p className="text-rose-300/80 text-xs font-medium mb-6 tracking-wide uppercase">This action is irreversible.</p>
          <div className="flex gap-2 w-full">
            <button 
              onClick={() => setDeleteStatus('idle')}
              disabled={deleteStatus === 'deleting'}
              className="flex-[1] py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-rose-200 text-xs font-bold transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              onClick={handleConfirmDelete}
              disabled={deleteStatus === 'deleting'}
              className="flex-[2] py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-black text-xs font-black uppercase tracking-widest shadow-[0_0_20px_rgba(244,63,94,0.3)] transition-all disabled:opacity-80 flex items-center justify-center gap-1"
            >
              {deleteStatus === 'deleting' ? <Loader2 size={14} className="animate-spin" /> : 'Confirm Drop'}
            </button>
          </div>
        </div>
      )}
		</article>
	);
}
