import { useLocalStorage } from 'usehooks-ts';
import { useCallback, useState, useEffect } from 'react';

export interface CartItem {
  id: string; // menuItemId
  name: string;
  price: number; // stored in dollars
  quantity: number;
  image?: string;
}

export interface VendorCart {
  tenantId: string;
  tenantName: string;
  items: CartItem[];
}

export function useCart() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [cart, setCart] = useLocalStorage<VendorCart[]>('nummygo-cart', []);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const addToCart = useCallback(
    (tenantId: string, tenantName: string, item: Omit<CartItem, 'quantity'>, qty: number) => {
      setCart((prev) => {
        const cloned = [...prev];
        const vendorIndex = cloned.findIndex((v) => v.tenantId === tenantId);

        if (vendorIndex >= 0) {
          const vendorCart = cloned[vendorIndex]!;
          const itemIndex = vendorCart.items.findIndex((i) => i.id === item.id);

          if (itemIndex >= 0) {
            vendorCart.items[itemIndex]!.quantity += qty;
          } else {
            vendorCart.items.push({ ...item, quantity: qty });
          }
        } else {
          cloned.push({
            tenantId,
            tenantName,
            items: [{ ...item, quantity: qty }],
          });
        }
        return cloned;
      });
    },
    [setCart]
  );

  const updateItemQuantity = useCallback(
    (tenantId: string, itemId: string, qty: number) => {
      setCart((prev) => {
        const cloned = [...prev];
        const vendorIndex = cloned.findIndex((v) => v.tenantId === tenantId);

        if (vendorIndex >= 0) {
          const vendorCart = cloned[vendorIndex]!;
          const itemIndex = vendorCart.items.findIndex((i) => i.id === itemId);

          if (itemIndex >= 0) {
            if (qty <= 0) {
              vendorCart.items.splice(itemIndex, 1);
              if (vendorCart.items.length === 0) {
                cloned.splice(vendorIndex, 1);
              }
            } else {
              vendorCart.items[itemIndex]!.quantity = qty;
            }
          }
        }
        return cloned;
      });
    },
    [setCart]
  );

  const removeVendorCart = useCallback(
    (tenantId: string) => {
      setCart((prev) => prev.filter((v) => v.tenantId !== tenantId));
    },
    [setCart]
  );

  const clearAll = useCallback(() => {
    setCart([]);
  }, [setCart]);

  /**
   * Replaces the cart slot for a given vendor with items from an existing order.
   * Used by the modification-mode UX to pre-populate the cart when the customer
   * returns to the menu page to edit their order.
   *
   * ⚠️ This REPLACES the vendor's existing cart entry (not merges).
   * Other vendor carts are untouched.
   */
  const loadFromOrderItems = useCallback(
    (
      tenantId: string,
      tenantName: string,
      orderItems: Array<{ menuItemId: string; name: string; price: number; imageUrl: string | null; quantity: number }>,
    ) => {
      const items: CartItem[] = orderItems.map((i) => ({
        id: i.menuItemId,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        image: i.imageUrl ?? undefined,
      }));

      setCart((prev) => {
        const cloned = prev.filter((v) => v.tenantId !== tenantId);
        cloned.push({ tenantId, tenantName, items });
        return cloned;
      });
    },
    [setCart]
  );

  const totalItems = cart.reduce(
    (sum, vendor) => sum + vendor.items.reduce((acc, item) => acc + item.quantity, 0),
    0
  );

  const megaTotal = cart.reduce(
    (sum, vendor) => sum + vendor.items.reduce((acc, item) => acc + item.price * item.quantity, 0),
    0
  );

  return {
    cart,
    addToCart,
    updateItemQuantity,
    removeVendorCart,
    clearAll,
    loadFromOrderItems,
    totalItems,
    megaTotal,
    isLoaded,
  };
}
