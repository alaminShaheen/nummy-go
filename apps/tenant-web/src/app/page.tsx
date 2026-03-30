'use client';

import { useState } from 'react';

import Navbar      from '@/components/Navbar';
import HeroBanner  from '@/components/HeroBanner';
import VendorInfo  from '@/components/VendorInfo';
import MenuSection from '@/components/MenuSection';
import CartFab     from '@/components/CartFab';
import type { MenuItem } from '@/components/MenuItemCard';

/* ─── Mock Data ────────────────────────────────────────── */

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

/* ─── Cart accumulator type ────────────────────────────── */
interface CartEntry {
  item: MenuItem;
  qty:  number;
}

/* ─── Page ─────────────────────────────────────────────── */

export default function TenantLandingPage() {
  const [cart, setCart] = useState<CartEntry[]>([]);

  const handleAddToCart = (item: MenuItem, qty: number) => {
    setCart((prev) => {
      const existing = prev.find((e) => e.item.id === item.id);
      if (existing) {
        return prev.map((e) =>
          e.item.id === item.id ? { ...e, qty: e.qty + qty } : e
        );
      }
      return [...prev, { item, qty }];
    });
  };

  const totalItems = cart.reduce((sum, e) => sum + e.qty, 0);

  return (
    <>
      {/* Sticky navigation */}
      <Navbar cartCount={totalItems} />

      <main>
        {/* 1 — Hero */}
        <HeroBanner />

        {/* Divider gradient line */}
        <div
          className="h-px mx-auto max-w-5xl"
          style={{ background: 'linear-gradient(to right, transparent, rgba(251,191,36,0.3), transparent)' }}
          aria-hidden="true"
        />

        {/* 2 — Vendor info */}
        <VendorInfo {...VENDOR} />

        {/* Divider */}
        <div
          className="h-px mx-auto max-w-5xl"
          style={{ background: 'linear-gradient(to right, transparent, rgba(99,102,241,0.2), transparent)' }}
          aria-hidden="true"
        />

        {/* 3 — Menu */}
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

      {/* Floating cart button */}
      <CartFab itemCount={totalItems} />
    </>
  );
}
