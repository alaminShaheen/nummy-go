'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { trpc } from '@/trpc/client';
import { GradientButton } from '@/components/ui';
import MenuItemEditor from '@/components/MenuItemEditor';
import MenuItemCard from '@/components/MenuItemCard';
import Navbar from '@/components/Navbar';

export default function TenantMenuDashboard() {
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const utils = trpc.useUtils();
  const { data: menuItems, isLoading } = trpc.menu.getMenuItems.useQuery();
  const { data: menuCategories } = trpc.category.getMenuCategories.useQuery();
  const deleteMutation = trpc.menu.deleteMenuItem.useMutation({
    onSuccess: () => utils.menu.getMenuItems.invalidate(),
  });

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setEditorOpen(true);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setEditorOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this menu item?")) {
      deleteMutation.mutate({ id });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-slate-400">
        Loading menu items...
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="pt-24 sm:pt-28 p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in relative min-h-screen">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black gradient-text">Menu Builder</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your dishes, prices, and availability.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* ADD NEW DISH PLACEHOLDER */}
        <button
          onClick={handleAddNew}
          className="
            flex flex-col items-center justify-center gap-3
            w-full aspect-[4/3] rounded-2xl
            border-2 border-dashed border-amber-500/30 text-amber-500/70
            hover:border-amber-400 hover:text-amber-400 hover:bg-amber-400/5
            transition-all duration-300 font-semibold uppercase tracking-widest text-sm
          "
        >
          <div className="p-3 rounded-full bg-amber-500/10">
            <Plus className="size-6" />
          </div>
          Add New Dish
        </button>

        {/* EXISTING ITEMS */}
        {menuItems?.map((item) => {
          const categoryName = menuCategories?.find((c) => c.id === item.categoryId)?.name;
          const mappedItem = {
            ...item,
            image: item.imageUrl || '',
            description: item.description || ''
          };
          return (
            <MenuItemCard 
              key={item.id} 
              item={mappedItem as any} 
              categoryName={categoryName}
              mode="builder"
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          );
        })}
      </div>

      {/* Slide-over Editor Modal */}
      {editorOpen && (
        <MenuItemEditor
          initialData={editingItem}
          onClose={() => setEditorOpen(false)}
        />
      )}
      </div>
    </>
  );
}
