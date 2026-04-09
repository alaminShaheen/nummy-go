'use client';

import { useState, useRef } from 'react';
import { z } from 'zod';
import { trpc } from '@/trpc/client';
import { X, Loader2, UploadCloud, Trash2, Check } from 'lucide-react';
import { GradientButton, GlossButton } from '@/components/ui';
import Image from 'next/image';

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  imageUrl: z.string().optional().or(z.literal('')),
  price: z.number().min(0, "Price must be positive"),
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

          <div className="space-y-5 flex-1">
            
            {/* Image Dropzone */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Dish Image</label>
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
                    isDragging ? 'border-amber-500 bg-amber-500/10 text-amber-500 scale-[1.02]' : 'border-white/10 hover:border-white/20 bg-black/20 text-slate-500 hover:text-slate-300'
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
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Dish Name *</label>
              <input
                type="text"
                autoFocus
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g. Smash Burger & Fries"
                className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Briefly describe the ingredients and preparation..."
                rows={3}
                className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Price ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleChange('price', parseFloat(e.target.value))}
                  className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Highlight Badge</label>
                <select
                  value={formData.badge}
                  onChange={(e) => handleChange('badge', e.target.value)}
                  className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                >
                  <option value="">None</option>
                  <option value="Popular">Popular</option>
                  <option value="Chef's Pick">Chef's Pick</option>
                  <option value="New">New</option>
                  <option value="Spicy">Spicy</option>
                  <option value="Vegan">Vegan</option>
                  <option value="Gluten-Free">Gluten-Free</option>
                </select>
              </div>
            </div>

            {/* Menu Category Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Menu Category</label>
              {isCreatingCategory ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="New Category Name..."
                    className="flex-1 px-4 py-2 bg-black/20 border border-indigo-500/50 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                    autoFocus
                  />
                  <button 
                    type="button"
                    onClick={handleCreateCategory}
                    disabled={createCategoryMutation.isPending}
                    className="p-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg transition-colors flex-shrink-0"
                  >
                    {createCategoryMutation.isPending ? <Loader2 className="size-5 animate-spin" /> : <Check className="size-5" />}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsCreatingCategory(false)}
                    className="p-2 bg-white/10 hover:bg-white/20 text-slate-300 rounded-lg transition-colors flex-shrink-0"
                  >
                    <X className="size-5" />
                  </button>
                </div>
              ) : (
                <select
                  value={formData.categoryId}
                  onChange={(e) => {
                    if (e.target.value === 'ADD_NEW') {
                      setIsCreatingCategory(true);
                    } else {
                      handleChange('categoryId', e.target.value);
                    }
                  }}
                  className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  disabled={categoriesLoading}
                >
                  <option value="">Ungrouped</option>
                  {menuCategories?.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                  <option value="ADD_NEW" className="font-semibold text-indigo-400">+ Create New Category...</option>
                </select>
              )}
            </div>

            {/* Custom Interactive Switch */}
            <div className="pt-2 flex items-center justify-between bg-black/20 p-4 rounded-xl border border-white/5">
              <div>
                <p className="text-sm font-medium text-slate-200">Available on Menu</p>
                <p className="text-xs text-slate-500 mt-0.5">Toggle off to hide item from customers</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={formData.isAvailable}
                onClick={() => handleChange('isAvailable', !formData.isAvailable)}
                className={`
                  relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:ring-offset-2 focus:ring-offset-[#0D1117]
                  ${formData.isAvailable ? 'bg-amber-500' : 'bg-slate-700'}
                `}
              >
                <span className="sr-only">Menu availability state</span>
                <span
                  aria-hidden="true"
                  className={`
                    pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                    ${formData.isAvailable ? 'translate-x-5' : 'translate-x-0'}
                  `}
                />
              </button>
            </div>
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
