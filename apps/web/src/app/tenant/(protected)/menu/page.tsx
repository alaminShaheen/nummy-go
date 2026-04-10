'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { trpc } from '@/trpc/client';
import MenuItemCard from '@/components/MenuItemCard';

export default function TenantMenuDashboard() {
  const [draftForms, setDraftForms] = useState<Record<string, boolean>>({});

  const utils = trpc.useUtils();
  const { data: menuItems, isLoading } = trpc.menu.getMenuItems.useQuery();
  const { data: menuCategories } = trpc.category.getMenuCategories.useQuery();

  const updateMutation = trpc.menu.updateMenuItem.useMutation({
    onSuccess: () => utils.menu.getMenuItems.invalidate(),
    onError: (err) => alert('Failed to update dish: ' + err.message)
  });

  const createMutation = trpc.menu.createMenuItem.useMutation({
    onSuccess: (res, variables) => {
      utils.menu.getMenuItems.invalidate();
      setDraftForms(prev => ({ ...prev, [variables.categoryId || 'uncategorized']: false }));
      alert('Dish created!');
    },
    onError: (err) => alert('Failed to create dish: ' + err.message)
  });

  const deleteMutation = trpc.menu.deleteMenuItem.useMutation({
    onSuccess: () => {
      utils.menu.getMenuItems.invalidate();
    },
  });

  const handleUpdateField = (id: string, field: string, value: any) => {
    updateMutation.mutate({ id, [field]: value });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to permanently delete this menu item?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleDraftSave = (categoryId: string, item: any) => {
    if (!item.name || !item.price) {
      alert('Name and price are required.');
      return;
    }
    createMutation.mutate({
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

  return (
    <>
      <div className="p-4 sm:p-8 max-w-[1400px] mx-auto space-y-12 animate-fade-in relative min-h-screen">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-8">
          <div>
            <h1 className="text-3xl font-black gradient-text">Inline Canvas</h1>
            <p className="text-slate-400 text-sm mt-1">
              Click any text to edit directly. Drop an image to upload. Changes save automatically.
            </p>
          </div>
        </div>

        {swimlanes.map((lane) => (
          <div key={lane.categoryId} className="space-y-6">
            <h2 className="text-2xl font-black text-amber-500/90 tracking-tight flex items-center gap-3">
              {lane.categoryName}
              <span className="text-sm font-medium bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full border border-amber-500/20">
                {lane.items.length} items
              </span>
            </h2>

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
                  onUpdateField={handleUpdateField}
                  onDelete={handleDelete}
                />
              ))}

              {/* GHOST CARD / DRAFT MODE */}
              {draftForms[lane.categoryId] ? (
                <MenuItemCard 
                  item={{ id: 'draft', name: '', description: '', price: 0, image: '', categoryId: lane.categoryId === 'uncategorized' ? null : lane.categoryId }}
                  mode="draft"
                  onDraftSave={(modifiedItem) => handleDraftSave(lane.categoryId, modifiedItem)}
                  onDraftCancel={() => setDraftForms(prev => ({ ...prev, [lane.categoryId]: false }))}
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
          <div className="py-20 text-center text-slate-500">
            No categories or menus configured yet.
          </div>
        )}
      </div>
    </>
  );
}
