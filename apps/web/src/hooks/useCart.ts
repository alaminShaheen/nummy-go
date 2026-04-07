import { useLocalStorage } from 'usehooks-ts';
import { useCallback } from 'react';

export interface CartItem {
  id: string; // menuItemId
  name: string;
  price: number; // Stored in dollars
  quantity: number;
  image?: string;
}

export interface VendorCart {
  tenantId: string;
  tenantName: string;
  items: CartItem[];
}

export function useCart() {
  const [cart, setCart] = useLocalStorage<VendorCart[]>('nummygo-cart', []);

  const addToCart = useCallback(
    (tenantId: string, tenantName: string, item: Omit<CartItem, 'quantity'>, qty: number) => {
      setCart((prev) => {
        const cloned = [...prev];
        const vendorIndex = cloned.findIndex((v) => v.tenantId === tenantId);

        if (vendorIndex >= 0) {
          // Vendor exists, append/update item
          const vendorCart = cloned[vendorIndex]!;
          const itemIndex = vendorCart.items.findIndex((i) => i.id === item.id);

          if (itemIndex >= 0) {
            vendorCart.items[itemIndex]!.quantity += qty;
          } else {
            vendorCart.items.push({ ...item, quantity: qty });
          }
        } else {
          // New vendor in cart
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
              // Remove item
              vendorCart.items.splice(itemIndex, 1);
              // Remove vendor if empty
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
    totalItems,
    megaTotal,
  };
}
