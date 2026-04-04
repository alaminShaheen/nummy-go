'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';

import Navbar      from '@/components/Navbar';
import HeroBanner  from '@/components/HeroBanner';
import VendorInfo  from '@/components/VendorInfo';
import MenuSection from '@/components/MenuSection';
import CartFab     from '@/components/CartFab';
import type { MenuItem } from '@/components/MenuItemCard';
import { GradientDivider } from '@/components/ui';
import { authClient } from '@/lib/auth-client';
import Link from 'next/link';
import { Pencil, ClipboardList } from 'lucide-react';

/* ─── Mock Data ─────────────────────────────────── */

const VENDOR = {
  name:    'The Golden Fork',
  address: '123 Maple Street, Toronto, ON M5V 2T6',
  mapUrl:  'https://www.google.com/maps/search/?api=1&query=123+Maple+Street+Toronto+ON',
  phone:   '+1 (416) 555-0192',
  email:   'hello@goldenfork.ca',
  hours: [
    { day: 'Mon – Fri', time: '11:00 AM – 10:00 PM' },
    { day: 'Saturday',  time: '10:00 AM – 11:00 PM' },
    { day: 'Sunday',    time: '10:00 AM – 9:00 PM'  },
  ],
  tags: ['🍔 Burgers', '🍝 Pasta', '🍣 Sushi', '🍫 Desserts', '🌿 Vegan options'],
};

const MENU_ITEMS: MenuItem[] = [
  {
    id:          'burger-01',
    name:        'Smash Burger & Fries',
    description: 'Double smash patty with aged cheddar, caramelised onions, house sauce, crispy golden fries.',
    price:       18.99,
    image:       '/images/burger.png',
    badge:       'Popular',
  },
  {
    id:          'pasta-01',
    name:        'Truffle Pappardelle',
    description: 'Hand-rolled pappardelle in a wild mushroom and black truffle cream sauce, shaved parmesan.',
    price:       22.50,
    image:       '/images/pasta.png',
    badge:       "Chef's Pick",
  },
  {
    id:          'sushi-01',
    name:        'Premium Sushi Platter',
    description: 'Chef selection of 8-pc nigiri and 8-pc maki, served with wasabi, ginger, and house soy.',
    price:       34.00,
    image:       '/images/sushi.png',
    badge:       'New',
  },
  {
    id:          'dessert-01',
    name:        'Chocolate Lava Cake',
    description: 'Warm dark chocolate fondant with molten centre, vanilla bean ice cream, salted caramel.',
    price:       12.99,
    image:       '/images/dessert.png',
  },
];

/* ─── Cart type ─────────────────────────────────── */
interface CartEntry { item: MenuItem; qty: number; }

/* ─── Component ─────────────────────────────────── */

export default function VendorStorefrontPage() {
  const params = useParams<{ slug: string }>();
  const [cart, setCart] = useState<CartEntry[]>([]);

  const { data: session } = authClient.useSession();
  const isVendorOwner = !!session?.user;

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
      <Navbar cartCount={totalItems} />

      <main>
        <HeroBanner />
        <GradientDivider accent="amber" />
        <VendorInfo {...VENDOR} />
        <GradientDivider accent="indigo" />
        <MenuSection items={MENU_ITEMS} onAddToCart={handleAddToCart} />

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

      {/* Vendor-only action bar */}
      {isVendorOwner && (
        <div
          id="vendor-actions-bar"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 vendor-actions-bar flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl shadow-black/60 animate-slide-up"
        >
          <span className="text-xs text-amber-400/80 font-semibold uppercase tracking-widest mr-2">
            Vendor
          </span>

          <Link
            href={`/${params.slug}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-amber-400/30 text-sm text-slate-300 hover:text-amber-400 font-medium transition-all duration-200"
          >
            <Pencil size={14} aria-hidden="true" />
            Edit Profile
          </Link>

          <Link
            href={`/${params.slug}/orders`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-600/10 hover:from-amber-500/20 hover:to-orange-600/20 border border-amber-400/20 hover:border-amber-400/40 text-sm text-amber-400 hover:text-amber-300 font-medium transition-all duration-200"
          >
            <ClipboardList size={14} aria-hidden="true" />
            Manage Orders
          </Link>
        </div>
      )}
    </>
  );
}
