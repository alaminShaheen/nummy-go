'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';

import Navbar from '@/components/Navbar';
import HeroBanner from '@/components/HeroBanner';
import VendorInfo from '@/components/VendorInfo';
import MenuSection from '@/components/MenuSection';
import CartFab from '@/components/CartFab';
import type { MenuItem } from '@/components/MenuItemCard';
import { GradientDivider } from '@/components/ui';
import { authClient } from '@/lib/auth-client';
import { Tenant } from '@nummygo/shared/models';
import { getGoogleMapsUrl } from '@/utils/tenant';
import { trpc } from '@/trpc/client';

/* ─── Mock Data ─────────────────────────────────── */

const VENDOR = {
  name: 'The Golden Fork',
  address: '123 Maple Street, Toronto, ON M5V 2T6',
  mapUrl: 'https://www.google.com/maps/search/?api=1&query=123+Maple+Street+Toronto+ON',
  phone: '+1 (416) 555-0192',
  email: 'hello@goldenfork.ca',
  hours: [
    { day: 'Mon – Fri', time: '11:00 AM – 10:00 PM' },
    { day: 'Saturday', time: '10:00 AM – 11:00 PM' },
    { day: 'Sunday', time: '10:00 AM – 9:00 PM' },
  ],
  tags: ['🍔 Burgers', '🍝 Pasta', '🍣 Sushi', '🍫 Desserts', '🌿 Vegan options'],
};

const MENU_ITEMS: MenuItem[] = [
  {
    id: 'burger-01',
    name: 'Smash Burger & Fries',
    description: 'Double smash patty with aged cheddar, caramelised onions, house sauce, crispy golden fries.',
    price: 18.99,
    image: '/images/burger.png',
    badge: 'Popular',
  },
  {
    id: 'pasta-01',
    name: 'Truffle Pappardelle',
    description: 'Hand-rolled pappardelle in a wild mushroom and black truffle cream sauce, shaved parmesan.',
    price: 22.50,
    image: '/images/pasta.png',
    badge: "Chef's Pick",
  },
  {
    id: 'sushi-01',
    name: 'Premium Sushi Platter',
    description: 'Chef selection of 8-pc nigiri and 8-pc maki, served with wasabi, ginger, and house soy.',
    price: 34.00,
    image: '/images/sushi.png',
    badge: 'New',
  },
  {
    id: 'dessert-01',
    name: 'Chocolate Lava Cake',
    description: 'Warm dark chocolate fondant with molten centre, vanilla bean ice cream, salted caramel.',
    price: 12.99,
    image: '/images/dessert.png',
  },
];

/* ─── Cart type ─────────────────────────────────── */
interface CartEntry { item: MenuItem; qty: number; }

/* ─── Component ─────────────────────────────────── */

export default function VendorStorefrontPage({ tenant }: { tenant: Tenant }) {
  const params = useParams<{ slug: string }>();
  const [cart, setCart] = useState<CartEntry[]>([]);

  const { data: session } = authClient.useSession();
  const isVendorOwner = !!session?.user;

  const { data: serverMenuItems } = trpc.tenant.getStorefrontMenu.useQuery({ tenantId: tenant.id });
  const { data: serverCategories } = trpc.tenant.getStorefrontCategories.useQuery({ tenantId: tenant.id });
  const displayItems: MenuItem[] = serverMenuItems && serverMenuItems.length > 0 
    ? serverMenuItems.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        price: item.price / 100,
        image: item.imageUrl || '',
        badge: item.badge || undefined,
        categoryId: item.categoryId || null,
      }))
    : MENU_ITEMS;

  const handleAddToCart = (item: MenuItem, qty: number) => {
    setCart((prev) => {
      const existing = prev.find((e) => e.item.id === item.id);
      if (existing) {
        return prev.map((e) => e.item.id === item.id ? { ...e, qty: e.qty + qty } : e);
      }
      return [...prev, { item, qty }];
    });
  };

  const totalItems = cart.reduce((sum, e) => sum + e.qty, 0);

  return (
    <>
      <Navbar />

      <main>
        <HeroBanner isVendorOwner={isVendorOwner} />
        <GradientDivider accent="amber" />
        <VendorInfo
          name={tenant.name}
          address={tenant.address || ''}
          mapUrl={getGoogleMapsUrl(tenant.address || '')}
          phone={tenant.phoneNumber}
          email={tenant.email || ''}
          hours={tenant.businessHours ? [
            { day: 'Mon', time: tenant.businessHours.monday.closed ? 'Closed' : `${tenant.businessHours.monday.open} – ${tenant.businessHours.monday.close}` },
            { day: 'Tue', time: tenant.businessHours.tuesday.closed ? 'Closed' : `${tenant.businessHours.tuesday.open} – ${tenant.businessHours.tuesday.close}` },
            { day: 'Wed', time: tenant.businessHours.wednesday.closed ? 'Closed' : `${tenant.businessHours.wednesday.open} – ${tenant.businessHours.wednesday.close}` },
            { day: 'Thu', time: tenant.businessHours.thursday.closed ? 'Closed' : `${tenant.businessHours.thursday.open} – ${tenant.businessHours.thursday.close}` },
            { day: 'Fri', time: tenant.businessHours.friday.closed ? 'Closed' : `${tenant.businessHours.friday.open} – ${tenant.businessHours.friday.close}` },
            { day: 'Sat', time: tenant.businessHours.saturday.closed ? 'Closed' : `${tenant.businessHours.saturday.open} – ${tenant.businessHours.saturday.close}` },
            { day: 'Sun', time: tenant.businessHours.sunday.closed ? 'Closed' : `${tenant.businessHours.sunday.open} – ${tenant.businessHours.sunday.close}` },
          ] : VENDOR.hours}
          tags={VENDOR.tags}
        />
        <GradientDivider accent="indigo" />
        <MenuSection items={displayItems} categories={serverCategories || []} onAddToCart={handleAddToCart} isVendorOwner={isVendorOwner} />

        {/* Footer */}
        <footer className="py-10 px-4 text-center border-t border-white/5">
          <p className="text-slate-600 text-sm">
            © {new Date().getFullYear()}&nbsp;
            <span className="gradient-text font-semibold">nummyGo</span>
            &nbsp;· Built with ❤️ for local restaurants
          </p>
        </footer>
      </main>

      <CartFab itemCount={totalItems} />
    </>
  );
}
