'use client';

import { useState, useRef } from 'react';
import { z } from 'zod';
import { trpc } from '@/trpc/client';
import { X, Loader2, UploadCloud, Trash2, Check } from 'lucide-react';
import { GradientButton, GlossButton, BrandInput, BrandSwitch, FormField } from '@/components/ui';
import Image from 'next/image';

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  imageUrl: z.string().optional().or(z.literal('')),
  price: z.number().min(0, "Price must be positive"),
  calories: z.number().int().positive().nullable().optional(),
  categoryId: z.string().optional(),
  isAvailable: z.boolean().default(true),
  badge: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function MenuItemEditor({ initialData, onClose }: { initialData: any, onClose: () => void }) {
  const utils = trpc.useUtils();
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Category state
  const { data: menuCategories, isLoading: categoriesLoading } = trpc.category.getMenuCategories.useQuery();
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const isEditing = !!initialData;

  const createCategoryMutation = trpc.category.createMenuCategory.useMutation({
    onSuccess: (data) => {
      utils.category.getMenuCategories.invalidate();
      setIsCreatingCategory(false);
      setNewCategoryName('');
      handleChange('categoryId', data.id);
    },
    onError: (err) => setErrorMsg(err.message),
  });

  const createMutation = trpc.menu.createMenuItem.useMutation({
    onSuccess: () => {
      utils.menu.getMenuItems.invalidate();
      onClose();
    },
    onError: (err) => setErrorMsg(err.message),
  });

  const updateMutation = trpc.menu.updateMenuItem.useMutation({
    onSuccess: () => {
      utils.menu.getMenuItems.invalidate();
      onClose();
    },
    onError: (err) => setErrorMsg(err.message),
  });

  const isPending = createMutation.isPending || updateMutation.isPending || createCategoryMutation.isPending;

  const [formData, setFormData] = useState<FormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    imageUrl: initialData?.imageUrl || '',
    price: initialData?.price ? Number(initialData.price) : 0,
    calories: initialData?.calories || null,
    categoryId: initialData?.categoryId || '',
    isAvailable: initialData?.isAvailable ?? true,
    badge: initialData?.badge || '',
  });

  const handleChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateCategory = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    createCategoryMutation.mutate({ name: newCategoryName });
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
          handleChange('imageUrl', dataUrl);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    } else if (file) {
      setErrorMsg("Invalid file. Please upload an image.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      const parsed = formSchema.parse(formData);
      // Clean up empty category selection
      const payload = {
        ...parsed,
        categoryId: parsed.categoryId || undefined,
      };
      
      if (isEditing) {
        updateMutation.mutate({
          id: initialData.id,
          ...payload,
          imageUrl: payload.imageUrl || null,
        });
      } else {
        createMutation.mutate({
          ...payload,
        });
      }
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        setErrorMsg(err.issues?.[0]?.message || "Validation Error");
      } else {
        setErrorMsg("Invalid data");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div 
        className="relative w-full max-w-md h-full bg-[#0D1117] border-l border-white/10 shadow-2xl overflow-y-auto animate-slide-up sm:animate-none flex flex-col"
        role="dialog"
        aria-label="Menu Item Editor"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-[#0D1117]/80 backdrop-blur border-b border-white/5">
          <h2 className="text-xl font-bold text-slate-100">{isEditing ? 'Edit Dish' : 'Add New Dish'}</h2>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1 flex flex-col">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
              {errorMsg}
            </div>
          )}

          <div className="space-y-6 flex-1">
            
            {/* Image Dropzone */}
            <FormField id="dishImage" label="Dish Image" hint="Recommended square or 4:3 (e.g. 800x600)">
              {formData.imageUrl ? (
                <div className="relative w-full h-48 rounded-xl overflow-hidden group">
                  <Image src={formData.imageUrl} alt="Preview" fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      type="button" 
                      onClick={() => handleChange('imageUrl', '')}
                      className="p-3 bg-rose-500 rounded-full text-white hover:scale-110 transition-transform shadow-lg"
                    >
                      <Trash2 className="size-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleFileUpload}
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                    isDragging ? 'border-amber-500 bg-amber-500/10 text-amber-500 scale-[1.02]' : 'border-white/10 hover:border-white/20 bg-white/[0.02] text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <UploadCloud className={`size-8 mb-2 ${isDragging ? 'animate-bounce' : ''}`} />
                  <p className="text-sm font-medium">Click or drag image to upload</p>
                  <input 
                    ref={fileInputRef} 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleFileUpload} 
                  />
                </div>
              )}
            </FormField>

            <FormField id="dishName" label="Dish Name" required>
              <BrandInput
                id="dishName"
                autoFocus
                value={formData.name}
                onValueChange={(val) => handleChange('name', val)}
                placeholder="e.g. Smash Burger & Fries"
              />
            </FormField>

            <FormField id="description" label="Description" hint="Briefly describe the ingredients and preparation...">
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Best burger in town..."
                rows={3}
                className="w-full rounded-xl bg-white/[0.04] border border-white/10 transition-colors duration-200 focus:border-amber-400/60 focus:bg-white/[0.06] focus:outline-none focus:ring-0 text-slate-100 placeholder:text-slate-600 px-4 py-2.5 resize-none"
              />
            </FormField>

            <div className="grid grid-cols-3 gap-4">
              <FormField id="price" label="Price ($)" required>
                <BrandInput
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleChange('price', parseFloat(e.target.value))}
                  placeholder="14.99"
                />
              </FormField>
              
              <FormField id="calories" label="Calories" hint="Optional">
                <BrandInput
                  id="calories"
                  type="number"
                  min="1"
                  step="1"
                  value={formData.calories ?? ''}
                  onChange={(e) => handleChange('calories', e.target.value ? parseInt(e.target.value, 10) : null)}
                  placeholder="450"
                  suffix={<span className="text-xs font-semibold text-slate-500 mr-1">cal</span>}
                />
              </FormField>
              
              <FormField id="highlightBadge" label="Highlight Badge">
                <select
                  id="highlightBadge"
                  value={formData.badge}
                  onChange={(e) => handleChange('badge', e.target.value)}
                  className="w-full rounded-xl bg-[#141A23] border border-white/10 text-slate-200 text-sm px-4 py-[11px] focus:outline-none focus:border-amber-400/60 transition-colors appearance-none"
                >
                  <option value="" className="bg-[#141A23]">None</option>
                  <option value="Popular" className="bg-[#141A23]">Popular</option>
                  <option value="Chef's Pick" className="bg-[#141A23]">Chef's Pick</option>
                  <option value="New" className="bg-[#141A23]">New</option>
                  <option value="Spicy" className="bg-[#141A23]">Spicy</option>
                  <option value="Vegan" className="bg-[#141A23]">Vegan</option>
                  <option value="Gluten-Free" className="bg-[#141A23]">Gluten-Free</option>
                </select>
              </FormField>
            </div>

            {/* Menu Category Selection */}
            <FormField id="menuCategory" label="Menu Category">
              {isCreatingCategory ? (
                <div className="flex items-center gap-2">
                  <BrandInput
                    id="newCategory"
                    type="text"
                    value={newCategoryName}
                    onValueChange={(val) => setNewCategoryName(val)}
                    placeholder="New Category Name..."
                    autoFocus
                  />
                  <button 
                    type="button"
                    onClick={handleCreateCategory}
                    disabled={createCategoryMutation.isPending}
                    className="p-[10px] bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl transition-colors flex-shrink-0"
                  >
                    {createCategoryMutation.isPending ? <Loader2 className="size-5 animate-spin" /> : <Check className="size-5" />}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsCreatingCategory(false)}
                    className="p-[10px] bg-white/10 hover:bg-white/20 text-slate-300 rounded-xl transition-colors flex-shrink-0"
                  >
                    <X className="size-5" />
                  </button>
                </div>
              ) : (
                <select
                  id="menuCategory"
                  value={formData.categoryId}
                  onChange={(e) => {
                    if (e.target.value === 'ADD_NEW') {
                      setIsCreatingCategory(true);
                    } else {
                      handleChange('categoryId', e.target.value);
                    }
                  }}
                  className="w-full rounded-xl bg-[#141A23] border border-white/10 text-slate-200 text-sm px-4 py-[11px] focus:outline-none focus:border-amber-400/60 transition-colors appearance-none"
                  disabled={categoriesLoading}
                >
                  <option value="" className="bg-[#141A23]">Ungrouped</option>
                  {menuCategories?.map((cat) => (
                    <option key={cat.id} value={cat.id} className="bg-[#141A23]">{cat.name}</option>
                  ))}
                  <option value="ADD_NEW" className="font-semibold text-indigo-400 bg-[#141A23]">+ Create New Category...</option>
                </select>
              )}
            </FormField>

            {/* Custom Interactive Switch */}
            <FormField id="availability" label="Available on Menu" hint="Toggle off to hide item from customers">
              <div className="flex items-center gap-3 py-2">
			          <BrandSwitch
			            ariaLabel="Toggle availability"
			            checked={formData.isAvailable}
			            onChange={(c) => handleChange('isAvailable', c)}
			          />
			          <span
			            className={`text-sm font-medium ${formData.isAvailable ? 'text-amber-400' : 'text-slate-400'}`}
			          >
			            {formData.isAvailable ? 'Item is Live' : 'Hidden / Sold Out'}
			          </span>
              </div>
            </FormField>
          </div>

          <div className="pt-6 border-t border-white/5 mt-auto flex gap-3">
            <GlossButton type="button" onClick={onClose} className="flex-1">
              Cancel
            </GlossButton>
            <GradientButton type="submit" disabled={isPending} className="flex-1 shadow-orange-900/30 font-bold">
              {isPending && <Loader2 className="size-4 animate-spin mr-2" />}
              {isEditing ? 'Save Changes' : 'Create Dish'}
            </GradientButton>
          </div>
        </form>
      </div>
    </div>
  );
}
