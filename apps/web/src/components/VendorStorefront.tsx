'use client';

import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState, Suspense } from 'react';

import Navbar from '@/components/Navbar';
import HeroBanner from '@/components/HeroBanner';
import VendorProfileHeader from '@/components/VendorProfileHeader';
import VendorMapDivider from '@/components/VendorMapDivider';
import MenuSection from '@/components/MenuSection';
import CartFab from '@/components/CartFab';
import type { MenuItem } from '@/components/MenuItemCard';
import { GradientDivider } from '@/components/ui';
import { trpc } from '@/trpc/client';
import { Tenant } from '@nummygo/shared/models';
import { getGoogleMapsUrl } from '@/utils/tenant';
import { useCart } from '@/hooks/useCart';
import { useModificationMode } from '@/hooks/useModificationMode';
import { differenceInSeconds } from 'date-fns';
import { Clock, Pencil, AlertTriangle, X } from 'lucide-react';

/* ─── Fallback Mock Data ────────────────────────── */

const VENDOR = {
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
];

/* ─── Countdown hook ────────────────────────────── */

function useCountdown(createdAt: number, thresholdMinutes: number) {
  const deadlineMs = createdAt + thresholdMinutes * 60 * 1000;
  const [secs, setSecs] = useState(() => Math.max(0, differenceInSeconds(deadlineMs, Date.now())));

  useEffect(() => {
    if (secs <= 0) return;
    const id = setInterval(() => setSecs(Math.max(0, differenceInSeconds(deadlineMs, Date.now()))), 1000);
    return () => clearInterval(id);
  }, [deadlineMs, secs]);

  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return { label: `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`, expired: secs <= 0 };
}

/* ─── Cart Replace Confirmation Modal ───────────── */

function CartReplaceModal({
  vendorName,
  onConfirm,
  onCancel,
}: {
  vendorName: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm bg-[#131920] border border-amber-500/20 rounded-2xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Replace cart items?</h3>
            <p className="text-xs text-slate-400">You have items from {vendorName} already in your cart.</p>
          </div>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">
          Entering modification mode will <span className="text-amber-400 font-semibold">replace your current cart</span> with
          the items from this existing order. Your other vendor carts won't be affected.
        </p>
        <div className="flex gap-3 pt-1">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:text-white text-sm font-semibold transition-colors"
          >
            Keep my cart
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold transition-colors"
          >
            Yes, replace it
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Modification Mode Banner ──────────────────── */

function ModificationBanner({
  orderId,
  sessionId,
  createdAt,
  onCancel,
}: {
  orderId: string;
  sessionId: string;
  createdAt: number;
  onCancel: () => void;
}) {
  const THRESHOLD = 30; // TODO: pull from tenant config
  const { label, expired } = useCountdown(createdAt, THRESHOLD);

  return (
    <div className="sticky top-0 z-30 w-full border-b border-amber-500/30 bg-amber-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30">
            <Pencil className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Modification Mode</span>
            <p className="text-sm text-slate-200 font-medium">
              Editing Order <span className="font-mono">#{orderId.slice(-6).toUpperCase()}</span>
              {' — '}adjust your items and submit when ready.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!expired && (
            <div className="flex items-center gap-1.5 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span className="font-mono font-bold">{label}</span>
              <span className="text-amber-400/60 ml-0.5">left</span>
            </div>
          )}
          {expired && (
            <span className="text-xs text-rose-400 font-semibold bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-1.5">
              Window expired
            </span>
          )}
          <button
            onClick={onCancel}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Component ─────────────────────────────────── */

function VendorStorefrontContent({ tenant }: { tenant: Tenant }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToCart, updateItemQuantity, loadFromOrderItems, cart } = useCart();
  const { activate, deactivate, mode, isActive } = useModificationMode();

  // URL params from the modification flow
  const modifyOrderId = searchParams.get('modify');
  const sessionId = searchParams.get('session');

  const loaded = useRef(false);
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [pendingOrderData, setPendingOrderData] = useState<{
    items: Array<{ menuItemId: string; name: string; price: number; imageUrl: string | null; quantity: number }>;
    createdAt: number;
  } | null>(null);

  const { data: serverMenuItems } = trpc.menu.getStorefrontMenu.useQuery({ tenantId: tenant.id });
  const { data: serverCategories } = trpc.category.getStorefrontCategories.useQuery({ tenantId: tenant.id });

  // Fetch order details only when ?modify is present
  const { data: orderDetails } = trpc.order.getOrderDetails.useQuery(
    { orderId: modifyOrderId! },
    { enabled: !!modifyOrderId && !loaded.current }
  );

  // Once order details are loaded, decide whether to show confirm modal or load directly
  useEffect(() => {
    if (!orderDetails || loaded.current) return;
    const existingVendorCart = cart.find((v) => v.tenantId === tenant.id);
    const hasExistingItems = existingVendorCart && existingVendorCart.items.length > 0;

    if (hasExistingItems) {
      // Show confirmation modal — cart already has items for this vendor
      setPendingOrderData({ items: orderDetails.items, createdAt: orderDetails.order.createdAt });
      setShowReplaceModal(true);
    } else {
      // No conflict — load straight away
      doLoadCart(orderDetails.items, orderDetails.order.createdAt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderDetails]);

  const doLoadCart = (
    items: Array<{ menuItemId: string; name: string; price: number; imageUrl: string | null; quantity: number }>,
    createdAt: number,
  ) => {
    loaded.current = true;
    loadFromOrderItems(tenant.id, tenant.name, items);
    if (modifyOrderId && sessionId) {
      activate({ orderId: modifyOrderId, sessionId });
    }
  };

  const handleConfirmReplace = () => {
    setShowReplaceModal(false);
    if (pendingOrderData) doLoadCart(pendingOrderData.items, pendingOrderData.createdAt);
  };

  const handleCancelModification = () => {
    deactivate();
    // Navigate back to the tracking page
    if (mode?.sessionId) {
      router.push(`/track/${mode.sessionId}`);
    } else if (sessionId) {
      router.push(`/track/${sessionId}`);
    } else {
      router.push('/');
    }
  };

  const displayItems: MenuItem[] = serverMenuItems && serverMenuItems.length > 0
    ? serverMenuItems.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description || '',
      price: item.price,
      image: item.imageUrl || '',
      badge: item.badge || undefined,
      categoryId: item.categoryId || null,
      calories: item.calories || null,
    }))
    : MENU_ITEMS;

  const handleAddToCart = (item: MenuItem, qty: number) => {
    addToCart(
      tenant.id,
      tenant.name,
      { id: item.id, name: item.name, price: item.price, image: item.image },
      qty
    );
  };

  const handleUpdateQuantity = (item: MenuItem, qty: number) => {
    const existingVendorCart = cart.find(v => v.tenantId === tenant.id);
    const existingItem = existingVendorCart?.items.find(i => i.id === item.id);
    
    if (existingItem) {
      updateItemQuantity(tenant.id, item.id, qty);
    } else if (qty > 0) {
      addToCart(tenant.id, tenant.name, { id: item.id, name: item.name, price: item.price, image: item.image }, qty);
    }
  };

  const vendorCart = cart.find((v) => v.tenantId === tenant.id);
  const cartQuantities = vendorCart 
    ? vendorCart.items.reduce((acc, obj) => {
        acc[obj.id] = obj.quantity;
        return acc;
      }, {} as Record<string, number>)
    : {};

  const inModMode = isActive && mode?.orderId === modifyOrderId;

  return (
    <>
      {/* Cart Replace Confirmation Modal */}
      {showReplaceModal && (
        <CartReplaceModal
          vendorName={tenant.name}
          onConfirm={handleConfirmReplace}
          onCancel={() => {
            setShowReplaceModal(false);
            // Stay on page, but don't activate mod mode
            router.replace(`/${tenant.slug}`);
          }}
        />
      )}

      {/* Modification Banner */}
      {inModMode && mode && (
        <ModificationBanner
          orderId={mode.orderId}
          sessionId={mode.sessionId}
          createdAt={orderDetails?.order.createdAt ?? 0}
          onCancel={handleCancelModification}
        />
      )}

      <Navbar />

      <main className="overflow-x-hidden w-full relative">
        <HeroBanner
          promotionalHeading={tenant.promotionalHeading}
          heroImageUrl={tenant.heroImageUrl}
        />
        
        <VendorProfileHeader 
          name={tenant.name}
          description={tenant.description}
          tags={tenant.tags}
          logoUrl={tenant.logoUrl}
          acceptsOrders={tenant.acceptsOrders ?? true}
          socialLinks={tenant.socialLinks}
        />

        <VendorMapDivider
          name={tenant.name}
          address={tenant.address || ''}
          latitude={tenant.latitude ?? undefined}
          longitude={tenant.longitude ?? undefined}
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
        />
        <MenuSection 
          items={displayItems} 
          categories={serverCategories || []} 
          onAddToCart={handleAddToCart} 
          onUpdateQuantity={handleUpdateQuantity}
          cartQuantities={cartQuantities}
          isClosed={!(tenant.acceptsOrders ?? true)}
        />

        <footer className="py-10 px-4 text-center border-t border-white/5">
          <p className="text-slate-600 text-sm">
            © {new Date().getFullYear()}&nbsp;
            <span className="gradient-text font-semibold">nummyGo</span>
            &nbsp;· Built with ❤️ for local restaurants
          </p>
        </footer>
      </main>

      <CartFab />
    </>
  );
}

export default function VendorStorefrontPage({ tenant }: { tenant: Tenant }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
        </div>
      }
    >
      <VendorStorefrontContent tenant={tenant} />
    </Suspense>
  );
}
