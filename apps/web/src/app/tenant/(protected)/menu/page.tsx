'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { trpc } from '@/trpc/client';
import { GradientButton } from '@/components/ui';
import MenuItemEditor from '@/components/MenuItemEditor';
import Navbar from '@/components/Navbar';

export default function TenantMenuDashboard() {
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const utils = trpc.useUtils();
  const { data: menuItems, isLoading } = trpc.tenant.getMenuItems.useQuery();
  const deleteMutation = trpc.tenant.deleteMenuItem.useMutation({
    onSuccess: () => utils.tenant.getMenuItems.invalidate(),
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
        {menuItems?.map((item) => (
          <article
            key={item.id}
            className={`
              relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-300 group
              ${item.isAvailable ? 'border-indigo-500/20 bg-[#1a2130]' : 'border-rose-500/20 bg-rose-950/20 opacity-75'}
            `}
          >
            {/* Hover Actions */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center justify-center gap-4 backdrop-blur-sm">
              <button
                onClick={() => handleEdit(item)}
                className="p-3 rounded-full bg-amber-500 text-black hover:bg-amber-400 transition-colors shadow-lg"
                title="Edit Item"
              >
                <Edit2 className="size-5" />
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="p-3 rounded-full bg-rose-500 text-white hover:bg-rose-400 transition-colors shadow-lg"
                title="Delete Item"
              >
                <Trash2 className="size-5" />
              </button>
            </div>

            {/* Thumbnail */}
            <div className="relative w-full h-40 bg-black/50">
              {item.imageUrl ? (
                <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-600">No Image</div>
              )}
              {item.badge && (
                <span className="absolute top-2 left-2 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-black bg-amber-400 rounded">
                  {item.badge}
                </span>
              )}
              {!item.isAvailable && (
                <span className="absolute top-2 right-2 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white bg-rose-500 rounded">
                  Sold Out
                </span>
              )}
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col gap-1">
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-bold text-slate-200 line-clamp-1">{item.name}</h3>
                <span className="text-amber-400 font-semibold">${(item.price / 100).toFixed(2)}</span>
              </div>
              <p className="text-slate-500 text-xs line-clamp-2">{item.description}</p>
            </div>
          </article>
        ))}
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
