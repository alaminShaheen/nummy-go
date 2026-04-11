'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, X, Check, Utensils, Lightbulb, Sparkles, AlertCircle, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/trpc/client';
import MenuItemCard from '@/components/MenuItemCard';
import MenuSection from '@/components/MenuSection';
import { cn, NummyGoBadge } from '@/components/ui';

export default function TenantMenuDashboard() {
  const [draftForms, setDraftForms] = useState<Record<string, boolean>>({});
  const [showGuide, setShowGuide] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const utils = trpc.useUtils();
  const { data: menuItems, isLoading } = trpc.menu.getMenuItems.useQuery();
  const { data: menuCategories } = trpc.category.getMenuCategories.useQuery();

  // Category Builder State
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isSparkling, setIsSparkling] = useState(false);

  // Category Deletion State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const createCategoryMutation = trpc.category.createMenuCategory.useMutation({
    onSuccess: () => {
      utils.category.getMenuCategories.invalidate();
      toast.success('Category created!');
    },
    onError: (err) => toast.error('Failed to create category', { description: err.message })
  });

  const deleteCategoryMutation = trpc.category.deleteMenuCategory.useMutation({
    onSuccess: () => {
      utils.category.getMenuCategories.invalidate();
      utils.menu.getMenuItems.invalidate(); // Invalidate items since their categoryId changed
      setDeleteConfirmId(null);
      toast.success('Category deleted');
    },
    onError: (err) => toast.error('Failed to delete category', { description: err.message })
  });

  const updateMutation = trpc.menu.updateMenuItem.useMutation({
    onSuccess: () => {
      utils.menu.getMenuItems.invalidate();
      toast.success('Dish updated');
    },
    onError: (err) => toast.error('Failed to update dish', { description: err.message })
  });

  const createMutation = trpc.menu.createMenuItem.useMutation({
    onSuccess: (res, variables) => {
      // NOTE: We do not globally invalidate here anymore! 
      // This prevents the duplicate UI glitch during the Draft Card's success animation.
      // Invalidation is handled manually when the Draft Card cleanly unmounts.
    },
    onError: (err) => toast.error('Failed to create dish', { description: err.message })
  });

  const deleteMutation = trpc.menu.deleteMenuItem.useMutation({
    onSuccess: () => {
      // We will invalidate manually in the component after it finishes to allow animations, or just invalidate here.
      utils.menu.getMenuItems.invalidate();
      toast.success('Dish permanently deleted');
    },
    onError: (err) => toast.error('Deletion failed', { description: err.message })
  });

  const handleUpdateField = (id: string, field: string, value: any) => {
    const payloadField = field === 'image' ? 'imageUrl' : field;
    updateMutation.mutate({ id, [payloadField]: value });
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync({ id });
  };

  const handleDraftSave = async (categoryId: string, item: any) => {
    await createMutation.mutateAsync({
      name: item.name,
      price: item.price,
      description: item.description,
      imageUrl: item.image,
      categoryId: categoryId === 'uncategorized' ? undefined : categoryId,
      calories: item.calories,
      isAvailable: true,
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-slate-400">
        Loading menu items...
      </div>
    );
  }

  // Mathematics for swimlanes
  const categoriesMap = new Map<string, any[]>();
  menuItems?.forEach(item => {
    const catId = item.categoryId || 'uncategorized';
    if (!categoriesMap.has(catId)) categoriesMap.set(catId, []);
    categoriesMap.get(catId)?.push(item);
  });

  // Ensure all defined categories have swimlanes even if empty
  menuCategories?.forEach(cat => {
    if (!categoriesMap.has(cat.id)) categoriesMap.set(cat.id, []);
  });

  const swimlanes = Array.from(categoriesMap.entries()).map(([catId, items]) => {
    const category = menuCategories?.find(c => c.id === catId);
    return {
      categoryId: catId,
      categoryName: category?.name || 'Uncategorized',
      items
    };
  });

  const handleCreateCategory = () => {
    const val = newCategoryName.trim();
    if (!val) return;

    setIsSparkling(true);
    setTimeout(() => {
      createCategoryMutation.mutate({ name: val, sortOrder: swimlanes.length });

      // Reset UI state
      setNewCategoryName('');
      setIsSparkling(false);
      setIsCreatingCategory(false);

      // Cinematic scroll down slightly to ensure new category is in view
      setTimeout(() => {
        window.scrollBy({ top: 400, behavior: 'smooth' });
      }, 100);
    }, 300); // Wait for sparkle to pop
  };

  const cancelCategoryCreation = () => {
    setNewCategoryName('');
    setIsCreatingCategory(false);
  };

  return (
    <>
      <div className="min-h-screen pt-8 pb-16 px-4 sm:px-6 lg:px-8 w-full" style={{ background: '#0D1117' }}>
        {/* Ambient glows matching Edit Profile */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
          <div
            style={{
              position: 'absolute',
              top: '-10%',
              left: '-5%',
              width: 600,
              height: 600,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(251,191,36,0.10) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '5%',
              right: '-5%',
              width: 500,
              height: 500,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }}
          />
        </div>

        <div className="relative z-10 max-w-[1400px] mx-auto space-y-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-white/5 pb-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-black gradient-text tracking-tight mb-2">Menu Builder</h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Design your storefront directly. Everything is live-editable. Changes are saved instantly and pushed to your customers in real-time.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={() => {
                setShowGuide(!showGuide);
                if (isPreviewMode) setIsPreviewMode(false);
              }}
              className={cn(
                "flex items-center justify-center gap-2 px-5 py-2.5 rounded-full transition-all text-xs font-black uppercase tracking-widest shrink-0 border",
                showGuide
                  ? "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
                  : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20 hover:shadow-[0_0_20px_rgba(99,102,241,0.2)]"
              )}
            >
              <Lightbulb size={16} strokeWidth={2.5} />
              {showGuide ? 'Hide Guide' : 'Builder Guide'}
            </button>

            <button
              onClick={() => {
                setIsPreviewMode(!isPreviewMode);
                if (showGuide) setShowGuide(false);
              }}
              className={cn(
                "flex items-center justify-center gap-2 px-5 py-2.5 rounded-full transition-all text-xs font-black uppercase tracking-widest shrink-0 border",
                isPreviewMode
                  ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white border-transparent shadow-[0_0_20px_rgba(245,158,11,0.4)] scale-105"
                  : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white"
              )}
            >
              <Eye size={16} strokeWidth={2.5} />
              {isPreviewMode ? 'Exit Preview' : 'Customer Preview'}
            </button>
          </div>
        </div>

          {/* ── Visual Guide Dropdown ── */}
        <div className={cn(
          "grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-out",
          showGuide && "grid-rows-[1fr]"
        )}>
            <div className="overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">

                {/* Pillar 1: Categories */}
                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 md:p-8 flex flex-col items-start gap-4 hover:bg-white/[0.04] transition-colors relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity scale-150 -translate-y-10 translate-x-10 pointer-events-none">
                    <Utensils size={200} />
                  </div>
                  <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 shadow-[inset_0_0_10px_rgba(245,158,11,0.1)] border border-amber-500/20">
                    <Plus strokeWidth={2.5} size={24} />
                  </div>
                  <div className="relative z-10 mt-2">
                    <h3 className="text-white font-bold text-lg mb-2">1. Organization</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      Build your menu structure using Categories (e.g., "Starters", "Mains"). Scroll to the bottom of the page to create a new category swimlane.
                    </p>
                  </div>
                </div>

                {/* Pillar 2: Live Editing */}
                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 md:p-8 flex flex-col items-start gap-4 hover:bg-white/[0.04] transition-colors relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity scale-150 -translate-y-10 translate-x-10 pointer-events-none">
                    <Sparkles size={200} />
                  </div>
                  <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 shadow-[inset_0_0_10px_rgba(99,102,241,0.1)] border border-indigo-500/20">
                    <Check strokeWidth={2.5} size={24} />
                  </div>
                  <div className="relative z-10 mt-2">
                    <h3 className="text-white font-bold text-lg mb-2">2. Inline Editing</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      No clunky forms. Click directly on any dish name, description, or price to instantly edit it. Drag and drop a photo straight onto the empty plate to upload.
                    </p>
                  </div>
                </div>

                {/* Pillar 3: Smart Badges */}
                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 md:p-8 flex flex-col items-start gap-4 hover:bg-white/[0.04] transition-colors relative overflow-hidden group md:col-span-2 lg:col-span-1">
                  <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 shadow-[inset_0_0_10px_rgba(244,63,94,0.1)] border border-rose-500/20">
                    <AlertCircle strokeWidth={2.5} size={24} />
                  </div>
                  <div className="w-full relative z-10 mt-2">
                    <h3 className="text-white font-bold text-lg mb-2">3. Smart Badging</h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-5">
                      Grab attention by adding a badge. Type specific keywords to unlock premium color themes instantly:
                    </p>
                    <div className="flex flex-wrap gap-2.5">
                      <NummyGoBadge label="Spicy" />
                      <NummyGoBadge label="Vegan" />
                      <NummyGoBadge label="Chef's Pick" />
                      <NummyGoBadge label="Promo" />
                      <NummyGoBadge label="New Order" />
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* ── Main Dynamic View Toggle (Builder vs Preview) ── */}
        {isPreviewMode ? (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out fill-mode-both mt-10 bg-[#0f141d]/50 border border-white/5 rounded-[3rem] pb-10 overflow-hidden relative shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 to-orange-600 shadow-[0_0_30px_rgba(245,158,11,0.6)]"></div>
            <div className="absolute top-6 left-6 flex items-center gap-2 bg-amber-500/10 text-amber-500 px-3 py-1.5 rounded-full border border-amber-500/20 z-50 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span className="text-[10px] font-black uppercase tracking-widest">Storefront Live Preview</span>
            </div>
            
            <div className="pt-16 sm:px-6">  
              <MenuSection 
                items={menuItems?.map(i => ({...i, image: i.imageUrl || '', description: i.description || ''})) || []} 
                categories={menuCategories || []}
              />
            </div>
            <div className="absolute bottom-6 inset-x-0 flex justify-center pointer-events-none">
              <p className="text-slate-500 text-xs uppercase tracking-widest font-black bg-black/50 px-4 py-2 rounded-full backdrop-blur-md border border-white/5">
                Ordering is disabled in preview mode
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* ── Category Swimlanes ── */}

            {swimlanes.map((lane, index) => (
            <div
              key={lane.categoryId}
              className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out fill-mode-both"
              style={{ animationDelay: `${index * 150}ms` }}
            >

              {/* Morphing Category Header */}
              {deleteConfirmId === lane.categoryId ? (
                <div className="flex items-center justify-between bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 animate-[slide-in-top_0.3s_ease]">
                  <div className="flex items-center gap-3 text-rose-500">
                    <Trash2 size={20} />
                    <div>
                      <h2 className="font-bold text-lg leading-tight tracking-tight">Delete {lane.categoryName}?</h2>
                      <p className="text-xs text-rose-500/80">Items inside will become Uncategorized.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => deleteCategoryMutation.mutate({ id: lane.categoryId })}
                      disabled={deleteCategoryMutation.isPending}
                      className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {deleteCategoryMutation.isPending ? 'Deleting...' : 'Confirm Delete'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="group/header flex items-center justify-between">
                  <h2 className="text-2xl font-black text-amber-500/90 tracking-tight flex items-center gap-3">
                    {lane.categoryName}
                    <span className="text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full border border-amber-500/20">
                      {lane.items.length} items
                    </span>

                    {/* Inline Delete Trigger - Only show for actual categories, not "Uncategorized" */}
                    {lane.categoryId !== 'uncategorized' && (
                      <button
                        onClick={() => setDeleteConfirmId(lane.categoryId)}
                        className="opacity-0 group-hover/header:opacity-100 transition-opacity p-2 rounded-full hover:bg-rose-500/10 text-rose-500/50 hover:text-rose-500"
                        title="Delete Category"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </h2>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* LIVE ITEMS */}
                {lane.items.map((item) => (
                  <MenuItemCard
                    key={item.id}
                    item={{
                      ...item,
                      image: item.imageUrl || '',
                      description: item.description || ''
                    }}
                    mode="builder"
                    categories={menuCategories}
                    onUpdateField={handleUpdateField}
                    onDelete={handleDelete}
                  />
                ))}

                {/* GHOST CARD / DRAFT MODE */}
                {draftForms[lane.categoryId] ? (
                  <MenuItemCard
                    key={`draft-${lane.categoryId}`}
                    item={{ id: 'draft', name: '', description: '', price: 0, image: '', categoryId: lane.categoryId === 'uncategorized' ? null : lane.categoryId }}
                    mode="draft"
                    categories={menuCategories}
                    onDraftSave={(modifiedItem) => handleDraftSave(lane.categoryId, modifiedItem)}
                    onDraftCancel={() => {
                      setDraftForms(prev => ({ ...prev, [lane.categoryId]: false }));
                      // Now smoothly invalidate TRPC so the newly saved item naturally replaces the unmounting draft card!
                      utils.menu.getMenuItems.invalidate();
                    }}
                  />
                ) : (
                  <button
                    onClick={() => setDraftForms(prev => ({ ...prev, [lane.categoryId]: true }))}
                    className="
                    flex flex-col items-center justify-center gap-3
                    w-full min-h-[380px] rounded-[2rem]
                    border-2 border-dashed border-amber-500/30 text-amber-500/70
                    hover:border-amber-400 hover:text-amber-400 hover:bg-amber-400/5 hover:shadow-[0_0_30px_rgba(245,158,11,0.1)]
                    transition-all duration-300 font-semibold uppercase tracking-widest text-sm
                  "
                  >
                    <div className="p-4 rounded-full bg-amber-500/10 transition-transform scale-100 group-hover:scale-110">
                      <Plus className="size-8" />
                    </div>
                    Add to {lane.categoryName}
                  </button>
                )}
              </div>
            </div>
          ))}

          {swimlanes.length === 0 && (
            <div className="py-20 text-center text-slate-500 pb-4">
              No categories or menus configured yet.
            </div>
          )}

          {/* ── Category Builder Block ── */}
          <div className="mt-16 w-full relative min-h-[140px] flex items-center justify-center">

            {/* Idle State */}
            <button
              className={`
              absolute inset-0 flex items-center justify-center gap-4 group
              border-2 border-dashed border-amber-500/30 text-amber-500/70
              hover:border-amber-400 hover:text-amber-400 hover:bg-amber-400/5 hover:shadow-[0_0_30px_rgba(245,158,11,0.1)]
              transition-all duration-300 font-semibold uppercase tracking-widest text-sm lg:text-base rounded-[2rem]
              ${isCreatingCategory ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100 pointer-events-auto'}
            `}
              onClick={() => setIsCreatingCategory(true)}
            >
              <div className="p-3 sm:p-4 rounded-full bg-amber-500/10 transition-transform scale-100 group-hover:scale-110">
                <Utensils className="chef-icon size-6 sm:size-7" />
              </div>
              Add New Menu Category
            </button>

            {/* Active State */}
            <div
              className={`
              absolute inset-0 flex flex-col sm:flex-row gap-6 px-6 sm:px-10 items-center justify-between
              border border-amber-500/60 bg-[rgba(19,25,31,0.95)] backdrop-blur-xl
              shadow-[0_0_30px_rgba(245,158,11,0.15),inset_0_0_20px_rgba(245,158,11,0.05)]
              rounded-[2rem] transition-all duration-300
              ${isCreatingCategory ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-105 pointer-events-none'}
            `}
            >
              <div className="flex-1 flex flex-col justify-center border-b sm:border-b-0 sm:border-r border-white/10 pb-4 sm:pb-0 sm:pr-8 w-full sm:w-auto">
                <label className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-1.5 opacity-80 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                  Naming New Category...
                </label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleCreateCategory();
                    if (e.key === 'Escape') cancelCategoryCreation();
                  }}
                  autoFocus={isCreatingCategory}
                  className="bg-transparent border-none outline-none text-2xl sm:text-4xl font-black tracking-tight text-white placeholder-slate-600 w-full"
                  placeholder="e.g. Desserts"
                />
              </div>
              <div className="flex w-full sm:w-auto items-center justify-center gap-2">
                <button
                  onClick={cancelCategoryCreation}
                  className="p-3 sm:p-4 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                  title="Cancel"
                >
                  <X size={20} className="stroke-[3]" />
                </button>
                <button
                  onClick={handleCreateCategory}
                  className={`flex-1 sm:w-40 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black uppercase tracking-widest text-xs py-4 rounded-full hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:scale-105 transition-all duration-300 ${isSparkling ? 'animate-sparkle' : ''}`}
                >
                  Create
                </button>
              </div>
            </div>
          </div>
          </>
        )}
      </div>
      </div>
    </>
  );
}
